import { useState, useEffect, useRef } from 'react'
import {
  groundingPhrases,
  choiceOptions,
  perspectivePhrases,
  releasePhrases,
  decidePhrases,
} from './phrases'
import './App.css'

const PHASE = {
  LANDING: 'landing',
  REGULATING: 'regulating',
  CHOICE: 'choice',
  DEEP: 'deep',
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getDeepPhrase(action) {
  switch (action) {
    case 'perspective': return randomFrom(perspectivePhrases)
    case 'release': return randomFrom(releasePhrases)
    case 'decide': return randomFrom(decidePhrases)
    case 'stay': return randomFrom(groundingPhrases)
    default: return ''
  }
}

export default function App() {
  const [phase, setPhase] = useState(PHASE.LANDING)
  const [phrase, setPhrase] = useState('')
  const [deepPhrase, setDeepPhrase] = useState('')
  const [visible, setVisible] = useState(true)
  const [pulseActive, setPulseActive] = useState(false)
  const timerRef = useRef(null)

  const fadeTransition = (fn) => {
    setVisible(false)
    setTimeout(() => {
      fn()
      setVisible(true)
    }, 400)
  }

  const handleButtonTap = () => {
    const p = randomFrom(groundingPhrases)
    fadeTransition(() => {
      setPhrase(p)
      setPhase(PHASE.REGULATING)
      setPulseActive(true)
    })
  }

  const handleChoice = (action) => {
    if (action === 'stay') {
      const p = randomFrom(groundingPhrases)
      fadeTransition(() => {
        setPhrase(p)
        setPhase(PHASE.REGULATING)
        setPulseActive(true)
      })
    } else {
      const dp = getDeepPhrase(action)
      fadeTransition(() => {
        setDeepPhrase(dp)
        setPhase(PHASE.DEEP)
      })
    }
  }

  const handleReset = () => {
    clearTimeout(timerRef.current)
    fadeTransition(() => {
      setPhase(PHASE.LANDING)
      setPhrase('')
      setDeepPhrase('')
      setPulseActive(false)
    })
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="app">
      <div className={`screen ${visible ? 'visible' : 'hidden'}`}>

        {phase === PHASE.LANDING && (
          <div className="center-layout">
            <p className="eyebrow">you don&apos;t have to know right now</p>
            <button className="idk-button" onClick={handleButtonTap}>
              <span className="button-label">IDK</span>
            </button>
            <p className="hint">tap when you&apos;re spiraling, stuck, or about to react</p>
          </div>
        )}

        {phase === PHASE.REGULATING && (
          <div className="center-layout">
            <div className={`breath-orb ${pulseActive ? 'pulse' : ''}`} />
            <p className="grounding-phrase">{phrase}</p>
            <div className="choice-grid">
              <button className="choice-btn" onClick={() => handleChoice('stay')}>Another one</button>
              <button className="choice-btn" onClick={() => fadeTransition(() => { setPhase(PHASE.CHOICE); setPulseActive(false) })}>Something else</button>
              <button className="choice-btn" onClick={handleReset}>I&apos;m good</button>
            </div>
          </div>
        )}

        {phase === PHASE.CHOICE && (
          <div className="center-layout">
            <p className="choice-prompt">how are you feeling?</p>
            <div className="choice-grid">
              {choiceOptions.map(opt => (
                <button
                  key={opt.action}
                  className="choice-btn"
                  onClick={() => handleChoice(opt.action)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="ghost-btn" onClick={handleReset}>← start over</button>
          </div>
        )}

        {phase === PHASE.DEEP && (
          <div className="center-layout">
            <p className="deep-phrase">{deepPhrase}</p>
            <div className="deep-actions">
              <button className="choice-btn" onClick={() => handleChoice('stay')}>
                Stay a little longer
              </button>
              <button className="ghost-btn" onClick={handleReset}>
                ← start over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
