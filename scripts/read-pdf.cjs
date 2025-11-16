const fs = require('fs');
const { PDFParse, VerbosityLevel } = require('pdf-parse');

(async () => {
  try {
    const file = process.argv[2];
    const offsetArg = process.argv[3];
    const offset = offsetArg ? Number(offsetArg) : 0;
    if (!file) {
      console.error('Usage: node scripts/read-pdf.cjs <path> [offset]');
      process.exit(1);
    }
    const dataBuffer = fs.readFileSync(file);
    const parser = new PDFParse({ data: dataBuffer, verbosity: VerbosityLevel.ERRORS });
    const result = await parser.getText();
    await parser.destroy();
    const text = result && result.text ? result.text : '';
    const start = Number.isFinite(offset) && offset > 0 ? offset : 0;
    process.stdout.write(text.slice(start, start + 8000));
  } catch (err) {
    console.error('ERROR:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
