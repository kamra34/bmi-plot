import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  Legend,
} from 'recharts'

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

export default function App() {
  const [heightCm, setHeightCm] = React.useState(175)
  const [minW, setMinW] = React.useState(40)
  const [maxW, setMaxW] = React.useState(140)
  const [step, setStep] = React.useState(0.5)

  const hM = heightCm / 100
  const hM2 = hM * hM

  const data = React.useMemo(() => {
    const rows = []
    const lo = Math.min(minW, maxW)
    const hi = Math.max(minW, maxW)
    const s = Math.max(0.1, step)
    for (let w = lo; w <= hi + 1e-9; w = +(w + s).toFixed(4)) {
      rows.push({ weight: +w.toFixed(2), bmi: +(w / hM2).toFixed(2) })
    }
    return rows
  }, [minW, maxW, step, hM2])

  const yVals = data.map(d => d.bmi)
  const yMin = Math.floor(Math.min(10, ...yVals, 100))
  const yMax = Math.ceil(Math.max(40, ...yVals, 0))

  const setRangeForHeight = (fromBMI, toBMI) => {
    const loW = fromBMI * hM2
    const hiW = toBMI * hM2
    setMinW(Math.floor(loW))
    setMaxW(Math.ceil(hiW))
  }

  return (
    <div className="container">
      <div className="h1">BMI as a Function of Weight</div>
      <p className="p">Adjust your height and weight range to see how BMI changes. Metric only: height in centimeters, weight in kilograms.</p>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{marginTop:0}}>Parameters</h3>
          <div className="grid">
            <div>
              <div className="row" style={{justifyContent:'space-between'}}>
                <label>Height (cm)</label>
                <input className="input" type="number" min={100} max={230} step={1} value={heightCm}
                  onChange={(e)=> setHeightCm(clamp(parseFloat(e.target.value||'0'), 100, 230))} />
              </div>
              <input className="slider" type="range" min={100} max={230} step={1} value={heightCm}
                onChange={(e)=> setHeightCm(parseFloat(e.target.value))} />
              <div className="kpi">h = {hM.toFixed(2)} m • h² = {hM2.toFixed(3)} m²</div>
            </div>

            <div className="grid grid-2">
              <div>
                <label>Min weight (kg)</label>
                <input className="input" type="number" step={0.5} value={minW}
                  onChange={(e)=> setMinW(parseFloat(e.target.value||'0'))} />
              </div>
              <div>
                <label>Max weight (kg)</label>
                <input className="input" type="number" step={0.5} value={maxW}
                  onChange={(e)=> setMaxW(parseFloat(e.target.value||'0'))} />
              </div>
              <div>
                <label>Weight step (kg)</label>
                <input className="input" type="number" step={0.1} value={step}
                  onChange={(e)=> setStep(clamp(parseFloat(e.target.value||'0.1'), 0.1, 10))} />
              </div>
              <div className="row" style={{alignItems:'flex-end'}}>
                <button className="btn" onClick={()=> setRangeForHeight(18.5, 24.9)} style={{width:'100%'}}>Normal BMI range</button>
              </div>
            </div>

            <div className="legend">
              <span className="badge" onClick={()=> setRangeForHeight(15, 20)}>Lean</span>
              <span className="badge" onClick={()=> setRangeForHeight(20, 25)}>20–25 BMI</span>
              <span className="badge" onClick={()=> setRangeForHeight(25, 30)}>Overweight</span>
              <span className="badge" onClick={()=> setRangeForHeight(30, 40)}>Obesity</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Interactive Plot</h3>
          <div style={{height:420}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />

                <ReferenceArea y1={0} y2={18.5} ifOverflow="extendDomain" opacity={0.08} />
                <ReferenceArea y1={18.5} y2={24.9} ifOverflow="extendDomain" opacity={0.12} />
                <ReferenceArea y1={24.9} y2={29.9} ifOverflow="extendDomain" opacity={0.08} />
                <ReferenceArea y1={29.9} y2={yMax} ifOverflow="extendDomain" opacity={0.06} />

                <XAxis dataKey="weight" type="number" domain={[Math.min(minW, maxW), Math.max(minW, maxW)]}
                  tickFormatter={(v)=> `${v}`} label={{ value: 'Weight (kg)', position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" domain={[yMin, yMax]} tickFormatter={(v)=> v.toFixed(0)}
                  label={{ value: 'BMI', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(val, name) => [val, name === 'bmi' ? 'BMI' : name]} />
                <Legend />
                <Line type="monotone" dataKey="bmi" name={`BMI @ ${heightCm} cm`} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="small">BMI = weight / (height²), with weight in kg and height in meters.</div>
        </div>
      </div>

      <div className="grid" style={{marginTop:16}}>
        <div className="card">
          <h3 style={{marginTop:0}}>Quick Converters</h3>
          <div className="grid grid-2">
            <Converter heightCm={heightCm} />
            <TargetBMI heightCm={heightCm} target={22} label="Target BMI 22" />
            <TargetBMI heightCm={heightCm} target={25} label="Upper normal BMI 25" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Converter({ heightCm }) {
  const hM2 = (heightCm / 100) ** 2
  const [w, setW] = React.useState(75)
  const bmi = +(w / hM2).toFixed(2)
  return (
    <div>
      <div className="row" style={{justifyContent:'space-between'}}>
        <label>Weight → BMI</label>
        <input className="input" type="number" value={w} step={0.1}
          onChange={(e)=> setW(parseFloat(e.target.value||'0'))} />
      </div>
      <div className="kpi">at height {heightCm} cm → <strong>BMI {bmi}</strong></div>
    </div>
  )
}

function TargetBMI({ heightCm, target, label }) {
  const hM2 = (heightCm / 100) ** 2
  const targetW = +(target * hM2).toFixed(1)
  return (
    <div>
      <div className="kpi">{label}</div>
      <div className="kpi">Weight ≈ <strong>{targetW} kg</strong> (for {heightCm} cm)</div>
    </div>
  )
}
