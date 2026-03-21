import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function exportNotebookToPdf(
  pages: { imageBase64: string }[],
  title: string
) {
  const pagesHtml = pages
    .map(
      (p) =>
        `<div style="page-break-after: always;"><img src="data:image/png;base64,${p.imageBase64}" style="width:100%;"/></div>`
    )
    .join('');
  const html = `<html><body style="margin:0;padding:0;">${pagesHtml}</body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: title,
  });
}

export async function exportNoteToPdf(htmlContent: string, title: string) {
  const html = `<html><head><style>body{font-family:sans-serif;padding:40px;color:#111;line-height:1.7;}h1{font-size:24px;margin-bottom:16px;}</style></head><body><h1>${title}</h1>${htmlContent}</body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: title,
  });
}
