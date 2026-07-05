import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts raw text from a File object (.pdf or .docx).
 * Throws a descriptive Error for unsupported types or parse failures.
 */
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractFromPdf(file);
  }
  if (name.endsWith(".docx")) {
    return extractFromDocx(file);
  }
  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files aren't supported. Please save the resume as .docx or .pdf and try again."
    );
  }
  throw new Error("Unsupported file type. Upload a .pdf or .docx resume.");
}

async function extractFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }
  if (!text.trim()) {
    throw new Error(
      "No selectable text found in this PDF. It may be a scanned image — try a text-based export instead."
    );
  }
  return text;
}

async function extractFromDocx(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  if (!result.value.trim()) {
    throw new Error("Couldn't find any text in this document.");
  }
  return result.value;
}
