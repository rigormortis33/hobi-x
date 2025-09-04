#!/usr/bin/env node
/*
  Kelime doğrulama ve düzeltme aracı
  Kullanım:
    node server/scripts/validate-words.js --dry-run
    node server/scripts/validate-words.js --apply
    node server/scripts/validate-words.js --pattern ITF%
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { pool } = require('../config/db');

const argv = process.argv.slice(2);
const isDryRun = argv.includes('--dry-run') || !argv.includes('--apply');
const apply = argv.includes('--apply');
const patternArg = argv.find(a => a.startsWith('--pattern'));
const pattern = patternArg ? patternArg.split('=')[1] : null;

// Türkçe büyük harf kümesi
const TURKISH_UPPER = new Set('ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ');

// Yaygın düzeltmeler (büyültülmüş olarak)
const corrections = new Map([
  ['ITFATIYE', 'ITFAIYE'], // itfatiye -> itfaiye
]);

function isValidTurkishWordUpper(word) {
  if (!word || typeof word !== 'string') return false;
  for (const ch of word) {
    if (!TURKISH_UPPER.has(ch)) return false;
  }
  return word.length >= 2 && word.length <= 30;
}

async function main() {
  console.log(`▶ Kelimeler taranıyor ${isDryRun ? '(dry-run)' : '(apply)'} ...`);
  const where = pattern ? 'WHERE word LIKE ?' : '';
  const params = pattern ? [pattern] : [];
  const [rows] = await pool.query(`SELECT id, word FROM kelime_matrisi_words ${where}`, params);

  const issues = [];
  const fixes = [];

  for (const r of rows) {
    const w = (r.word || '').toString().trim();
    const upper = w.toUpperCase();

    if (!isValidTurkishWordUpper(upper)) {
      issues.push({ id: r.id, word: w, reason: 'geçersiz karakter veya uzunluk' });
    }
    if (corrections.has(upper)) {
      const to = corrections.get(upper);
      fixes.push({ id: r.id, from: upper, to });
    }
  }

  console.log(`Toplam incelenen: ${rows.length}`);
  console.log(`Şüpheli (karakter/uzunluk): ${issues.length}`);
  console.log(`Olası düzeltme eşleşmesi: ${fixes.length}`);

  if (issues.length) {
    console.log('Örnek şüpheli ilk 10:', issues.slice(0, 10));
  }
  if (fixes.length) {
    console.log('Düzeltme önerileri:', fixes);
  }

  if (apply && fixes.length) {
    console.log('🔧 Düzeltmeler uygulanıyor...');
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const f of fixes) {
        await conn.query('UPDATE kelime_matrisi_words SET word = ? WHERE id = ?', [f.to, f.id]);
      }
      await conn.commit();
      console.log('✅ Düzeltmeler uygulandı');
    } catch (e) {
      await conn.rollback();
      console.error('❌ Düzeltme hatası:', e.message);
      process.exitCode = 1;
    } finally {
      conn.release();
    }
  } else {
    if (!apply) {
      console.log('Dry-run modunda sadece raporlandı. Uygulamak için --apply kullanın.');
    }
  }

  // Opsiyonel: JSON fallback güncelle
  try {
    const [all] = await pool.query('SELECT word FROM kelime_matrisi_words');
    const out = all.map(r => (r.word || '').toString().trim().toUpperCase()).filter(Boolean);
    const jsonPath = path.join(__dirname, '..', 'games', 'turkce_kelimeler.json');
    fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('📁 JSON fallback güncellendi:', jsonPath, `(${out.length} kelime)`);
  } catch (e) {
    console.warn('JSON fallback güncellenemedi:', e.message);
  }
}

main().then(() => process.exit()).catch(err => { console.error(err); process.exit(1); });
