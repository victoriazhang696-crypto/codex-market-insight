const roadmap = [
  'AI 市场助理',
  '股票分析中心',
  '机会追踪提醒',
  '课程中心'
];

export default function SoonPage() {
  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">待上线惊喜</p>
        <h1>未来功能预览</h1>
        <p className="lede">这里先占位，后续会逐步接入 AI 问答、股票分析和会员课程内容。</p>
      </section>

      <section className="card-grid" style={{ marginTop: 16 }}>
        {roadmap.map((item) => (
          <article key={item} className="feature-card">
            <h2>{item}</h2>
            <p>规划中，后续接入。</p>
          </article>
        ))}
      </section>
    </main>
  );
}
