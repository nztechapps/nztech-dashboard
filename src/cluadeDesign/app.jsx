/* global React, ReactDOM */
const { useState, useEffect } = React;

function App() {
  const TWEAKS = /*EDITMODE-BEGIN*/{
    "theme": "light",
    "primaryHue": 285,
    "density": "comfortable",
    "showSocial": true,
    "showPipeline": true,
    "showTasks": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAKS);
  const [active, setActive] = useState('dashboard');

  // Apply theme + primary hue
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.style.setProperty('--primary',
      t.theme === 'dark'
        ? `oklch(0.68 0.19 ${t.primaryHue})`
        : `oklch(0.55 0.22 ${t.primaryHue})`);
    document.documentElement.style.setProperty('--primary-hover',
      t.theme === 'dark'
        ? `oklch(0.74 0.18 ${t.primaryHue})`
        : `oklch(0.48 0.22 ${t.primaryHue})`);
    document.documentElement.style.setProperty('--primary-soft',
      t.theme === 'dark'
        ? `oklch(0.28 0.05 ${t.primaryHue})`
        : `oklch(0.97 0.02 ${t.primaryHue})`);
  }, [t.theme, t.primaryHue]);

  const titles = {
    dashboard: 'Dashboard',
    social: 'Social Media',
    pipeline: 'Sales Pipeline',
    tasks: 'Tasks',
  };

  const padding = t.density === 'compact' ? 20 : 28;

  const renderContent = () => {
    if (active === 'social') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <SocialInsights />
          <EngagementCard />
        </div>
      );
    }
    if (active === 'pipeline') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <PipelineKanban />
        </div>
      );
    }
    if (active === 'tasks') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <TaskList />
          <EngagementCard />
        </div>
      );
    }
    // Dashboard
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          {KPIS.map(k => <KPICard key={k.id} k={k} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {t.showSocial && <SocialInsights />}
          {t.showTasks && <EngagementCard />}
        </div>
        {t.showPipeline && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            <PipelineKanban />
          </div>
        )}
        {t.showTasks && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <TaskList />
            <EngagementCard />
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active={active} onChange={setActive} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          theme={t.theme}
          onToggleTheme={() => setTweak('theme', t.theme === 'dark' ? 'light' : 'dark')}
          title={titles[active]}
        />
        <main className="scroll" style={{ flex: 1, padding, overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakRadio label="Tema" value={t.theme}
            options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]}
            onChange={v => setTweak('theme', v)} />
          <TweakSlider label="Hue del primario" value={t.primaryHue} min={0} max={360} step={1}
            onChange={v => setTweak('primaryHue', v)} />
          <TweakRadio label="Densidad" value={t.density}
            options={[{ value: 'compact', label: 'Compacta' }, { value: 'comfortable', label: 'Cómoda' }]}
            onChange={v => setTweak('density', v)} />
        </TweakSection>
        <TweakSection title="Widgets del Dashboard">
          <TweakToggle label="Social Insights" value={t.showSocial} onChange={v => setTweak('showSocial', v)} />
          <TweakToggle label="Pipeline Kanban" value={t.showPipeline} onChange={v => setTweak('showPipeline', v)} />
          <TweakToggle label="Tasks" value={t.showTasks} onChange={v => setTweak('showTasks', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
