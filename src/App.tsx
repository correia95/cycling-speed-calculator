import { useEffect, useMemo, useState } from 'react';
import {
  State, Mode, SpeedUnit, distanceFromSpeedTime, speedFromDistanceTime, timeHoursFromDistanceSpeed,
  parseDuration, formatDuration, encodeState, decodeState,
} from './cycling';

function defaultState(): State {
  return { mode: 'time', unit: 'kmh', speed: 20, distance: 30, timeSeconds: 5400 };
}

function readInitialState(): State {
  const params = new URLSearchParams(window.location.search);
  if ([...params.keys()].length === 0) return defaultState();
  return decodeState(params, defaultState());
}

export default function App() {
  const [state, setState] = useState<State>(readInitialState);
  const [timeText, setTimeText] = useState(formatDuration(state.timeSeconds));
  const [copied, setCopied] = useState(false);

  const distanceUnit = state.unit === 'kmh' ? 'km' : 'mi';
  const speedUnit = state.unit === 'kmh' ? 'km/h' : 'mph';

  const computed = useMemo(() => {
    if (state.mode === 'time') {
      const hours = timeHoursFromDistanceSpeed(state.distance, state.speed);
      return hours === null ? null : hours * 3600;
    }
    if (state.mode === 'distance') {
      return distanceFromSpeedTime(state.speed, state.timeSeconds / 3600);
    }
    return speedFromDistanceTime(state.distance, state.timeSeconds / 3600);
  }, [state.mode, state.speed, state.distance, state.timeSeconds]);

  useEffect(() => {
    setTimeText(formatDuration(state.timeSeconds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeSeconds]);

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onTimeTextChange(value: string) {
    setTimeText(value);
    const parsed = parseDuration(value);
    if (parsed !== null) update('timeSeconds', parsed);
  }

  function onModeChange(mode: Mode) {
    setState((s) => {
      if (s.mode === 'time' && computed !== null) {
        return { ...s, mode, timeSeconds: computed };
      }
      return { ...s, mode };
    });
  }

  async function shareLink() {
    const params = encodeState(state);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', `?${params.toString()}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="page">
      <h1>Cycling Speed Calculator</h1>
      <p className="lede">
        Solve for speed, distance, or time — pick what you want to find, enter the other two.
      </p>

      <section className="panel">
        <h2>Unit</h2>
        <select value={state.unit} onChange={(e) => update('unit', e.target.value as SpeedUnit)}>
          <option value="kmh">Kilometres (km/h)</option>
          <option value="mph">Miles (mph)</option>
        </select>
      </section>

      <section className="panel">
        <h2>Find</h2>
        <div className="mode-tabs">
          <button type="button" className={state.mode === 'time' ? 'tab active' : 'tab'} onClick={() => onModeChange('time')}>Time</button>
          <button type="button" className={state.mode === 'distance' ? 'tab active' : 'tab'} onClick={() => onModeChange('distance')}>Distance</button>
          <button type="button" className={state.mode === 'speed' ? 'tab active' : 'tab'} onClick={() => onModeChange('speed')}>Speed</button>
        </div>

        <div className="field-grid">
          {state.mode !== 'speed' && (
            <label className="field">
              <span>Speed ({speedUnit})</span>
              <input type="number" step={0.5} value={state.speed} onChange={(e) => update('speed', e.target.valueAsNumber || 0)} />
            </label>
          )}
          {state.mode !== 'distance' && (
            <label className="field">
              <span>Distance ({distanceUnit})</span>
              <input type="number" step={1} value={state.distance} onChange={(e) => update('distance', e.target.valueAsNumber || 0)} />
            </label>
          )}
          {state.mode !== 'time' && (
            <label className="field">
              <span>Time (h:mm)</span>
              <input type="text" value={timeText} onChange={(e) => onTimeTextChange(e.target.value)} placeholder="1:30" />
            </label>
          )}
        </div>
      </section>

      <section className="result positive">
        {state.mode === 'time' && (
          <>
            <div className="small-label">Time</div>
            <div className="big-num">{computed === null ? '—' : formatDuration(computed)}</div>
          </>
        )}
        {state.mode === 'distance' && (
          <>
            <div className="small-label">Distance</div>
            <div className="big-num">{computed === null ? '—' : `${computed.toFixed(1)} ${distanceUnit}`}</div>
          </>
        )}
        {state.mode === 'speed' && (
          <>
            <div className="small-label">Average speed</div>
            <div className="big-num">{computed === null ? '—' : `${computed.toFixed(1)} ${speedUnit}`}</div>
          </>
        )}
      </section>

      <div className="actions">
        <button className="share-btn" onClick={shareLink}>{copied ? 'Copied!' : 'Copy share link'}</button>
      </div>

      <section className="explainer">
        <h2>How this works</h2>
        <p>
          These are all the same relationship — distance equals speed times time — rearranged for
          whichever value you're solving for. Pick "Time" to find how long a ride at a given speed
          and distance takes, "Distance" to find how far you'd go at a given speed over a given time,
          or "Speed" to find your average speed from a distance and a finish time.
        </p>
        <h2>Frequently asked questions</h2>
        <h3>Does this account for hills, wind, or stops?</h3>
        <p>No — this is average speed over the whole distance and time, treating the ride as constant. Real rides vary a lot within that average.</p>
        <h3>What's a typical cycling speed?</h3>
        <p>It varies enormously by rider, terrain, and bike — there's no single "typical" figure. Use your own recent rides as a reference instead.</p>
        <h3>Can I use this for a multi-stop route?</h3>
        <p>Only for the overall average across the whole trip — for a route with very different speed sections, calculate each section separately and add the times together.</p>
      </section>
    </main>
  );
}
