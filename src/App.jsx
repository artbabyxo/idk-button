import { useState, useEffect, useRef } from 'react'
import { sensoryPhrases, releasePhrases, landingTaglines } from './phrases'
import './App.css'

const PHASE = { LANDING: 'landing', PHRASE: 'phrase' }
const POOL = { SENSORY: 'sensory', RELEASE: 'release' }

function randomFrom(arr, exclude = null) {
  const options = exclude ? arr.filter(p => p !== exclude) : arr
  return options[Math.floor(Math.random() * options.length)]
}

export default function App() {
  const [phase, setPhase] = useState(PHASE.LANDING)
  const [pool, setPool] = useState(POOL.RELEASE)
  const [phrase, setPhrase] = useState('')
  const [tagline, setTagline] = useState(landingTaglines[0])
  const [taglineVisible, setTaglineVisible] = useState(true)
  const [visible, setVisible] = useState(true)
  const taglineTimer = useRef(null)

  // Rotate taglines on landing with fade transition
  useEffect(() => {
    if (phase !== PHASE.LANDING) return
    let i = 0
    taglineTimer.current = setInterval(() => {
      setTaglineVisible(false)
      setTimeout(() => {
        i = (i + 1) % landingTaglines.length
        setTagline(landingTaglines[i])
        setTaglineVisible(true)
      }, 800)
    }, 4000)
    return () => clearInterval(taglineTimer.current)
  }, [phase])

  const fade = (fn) => {
    setVisible(false)
    setTimeout(() => { fn(); setVisible(true) }, 380)
  }

  const handleTap = () => {
    const p = randomFrom(releasePhrases)
    fade(() => {
      setPool(POOL.RELEASE)
      setPhrase(p)
      setPhase(PHASE.PHRASE)
    })
  }

  const handleAnother = () => {
    const currentPool = pool === POOL.RELEASE ? releasePhrases : sensoryPhrases
    const p = randomFrom(currentPool, phrase)
    fade(() => setPhrase(p))
  }

  const handleSomethingElse = () => {
    const nextPool = pool === POOL.RELEASE ? POOL.SENSORY : POOL.RELEASE
    const nextPhrases = nextPool === POOL.RELEASE ? releasePhrases : sensoryPhrases
    const p = randomFrom(nextPhrases)
    fade(() => {
      setPool(nextPool)
      setPhrase(p)
    })
  }

  const handleGood = () => {
    fade(() => {
      setPhase(PHASE.LANDING)
      setPhrase('')
    })
  }

  return (
    <div className="app">
      <div className={`screen ${visible ? 'visible' : 'hidden'}`}>

        {phase === PHASE.LANDING && (
          <div className="center-layout">
            <p className={`tagline ${taglineVisible ? 'tagline-in' : 'tagline-out'}`}>{tagline}</p>
            <button className="idk-button" onClick={handleTap}>
              <span className="button-label">I don't know</span>
            </button>
          </div>
        )}

        {phase === PHASE.PHRASE && (
          <div className="center-layout">
            <p className="phrase">{phrase}</p>
            <div className="options">
              <button className="option-btn" onClick={handleAnother}>Another</button>
              <button className="option-btn" onClick={handleSomethingElse}>Something else</button>
              <button className="option-btn muted" onClick={handleGood}>I&apos;m good</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
