/* ============================================================
   KAS RT 01 / RW 01
   WhatsApp report helpers
   ============================================================ */

function buildWhatsAppReport() {
  const c = state.config || {};
  const d = state.dashboard || {};
  const now = new Date();

  const period = now.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });

  const lines = [
    `*LAPORAN KAS ${c.nama_rt || 'RT 01'} / ${c.nama_rw || 'RW 01'}*`,
    `${[c.dukuh, c.desa, c.kecamatan, c.kabupaten].filter(Boolean).join(' · ')}`,
    `Periode: *${period}*`,
    '',
    `💰 *Saldo Saat Ini*\n${rupiah(d.saldo || 0)}`,
    `📥 *Total Pemasukan*\n${rupiah(d.pemasukan || 0)}`,
    `📤 *Total Pengeluaran*\n${rupiah(d.pengeluaran || 0)}`,
    `🧾 *Jumlah Transaksi Aktif*\n${Number(d.jumlahTransaksi || 0)} transaksi`,
    '',
    '*Transaksi Terbaru*'
  ];

  const recent = (state.transactions || [])
    .filter(t => t.status === 'AKTIF')
    .slice(0, 10);

  if (!recent.length) {
    lines.push('Belum ada transaksi aktif.');
  } else {
    recent.forEach((t, i) => {
      const sign = t.jenis === 'Pemasukan' ? '+' : '-';
      const icon = t.jenis === 'Pemasukan' ? '🟢' : '🔴';
      lines.push(`${i + 1}. ${icon} ${t.tanggal} · ${t.kategori}`);
      lines.push(`   ${sign}${rupiah(t.nominal)} · ${t.keterangan}`);
    });
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('🙏 Terima kasih atas partisipasi dan kepercayaan warga.');
  lines.push('_Laporan dibuat otomatis melalui Sistem Kas RT._');

  return lines.join('\n');
}

function shareWhatsApp() {
  try {
    const text = buildWhatsAppReport();
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    errorToast(error);
  }
}

function copyWhatsAppReport() {
  const text = buildWhatsAppReport();

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => toast('✓ Laporan WhatsApp berhasil disalin.'))
      .catch(() => fallbackCopy(text));
    return;
  }

  fallbackCopy(text);
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();

  try {
    document.execCommand('copy');
    toast('✓ Laporan WhatsApp berhasil disalin.');
  } catch (error) {
    errorToast(error);
  } finally {
    area.remove();
  }
}
