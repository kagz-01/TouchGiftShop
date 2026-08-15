import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'wrappers');
    const entries = await fs.readdir(dir);
    const images = entries
      .filter((name) => name.toLowerCase().endsWith('.webp'))
      .sort((a, b) => {
        const numA = Number((a.match(/\d+/) || ['0'])[0]);
        const numB = Number((b.match(/\d+/) || ['0'])[0]);
        return numA - numB;
      })
      .map((n) => ({ src: `/wrappers/${n}`, placeholder: null }));

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
