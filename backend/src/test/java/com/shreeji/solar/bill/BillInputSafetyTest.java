package com.shreeji.solar.bill;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.ImageType;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class BillInputSafetyTest {

    @Test
    void sniffsTypeFromBytesNotClientHeader() throws Exception {
        byte[] html = "<html><script>alert(1)</script>".getBytes();
        assertNull(BillController.sniffType(new MockMultipartFile("file", "bill.png", "image/png", html)));

        byte[] pdf = "%PDF-1.7\n...".getBytes();
        assertEquals("application/pdf",
                BillController.sniffType(new MockMultipartFile("file", "bill.png", "image/png", pdf)));
    }

    @Test
    void refusesImagesOverThePixelBudget() throws Exception {
        // 5000x5000 = 25M px > 16M budget; compresses to a tiny PNG (decompression bomb shape).
        BufferedImage big = new BufferedImage(5000, 5000, BufferedImage.TYPE_BYTE_BINARY);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(big, "png", out);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> BillAnalysisService.readImageBounded(out.toByteArray()));
        assertTrue(ex.getMessage().contains("too large"));
    }

    @Test
    void decodesNormalImages() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB), "png", out);
        assertEquals(800, BillAnalysisService.readImageBounded(out.toByteArray()).getWidth());
    }

    private static byte[] pdfWithPage(PDRectangle size) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            doc.addPage(new PDPage(size));
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    @Test
    void largePdfPageIsRenderedAtLowerDpiWithinPixelBudget() throws Exception {
        // A0 at 300 DPI would be ~140M px; it must be scaled down instead.
        BufferedImage img = BillAnalysisService.renderFirstPage(pdfWithPage(PDRectangle.A0), 300, ImageType.GRAY);
        assertTrue((long) img.getWidth() * img.getHeight() <= BillAnalysisService.MAX_PIXELS);
    }

    @Test
    void absurdPdfPageIsRefused() throws Exception {
        // 200in square (PDF max) would be 3.6G px at 300 DPI — unreadable at any safe DPI.
        byte[] pdf = pdfWithPage(new PDRectangle(14_400, 14_400));
        assertThrows(IllegalArgumentException.class,
                () -> BillAnalysisService.renderFirstPage(pdf, 300, ImageType.GRAY));
    }

    @Test
    void a4BillStillRendersAtFullDpi() throws Exception {
        BufferedImage img = BillAnalysisService.renderFirstPage(pdfWithPage(PDRectangle.A4), 300, ImageType.GRAY);
        assertEquals(2480, img.getWidth(), 1); // 8.27in × 300 DPI
    }
}
