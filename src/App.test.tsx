import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import { SkyScene } from './modules/skyScene/SkyScene'

describe('App', () => {
  it('renders the main experience heading', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /single-screen astronomy experience/i })).toBeInTheDocument()
  })

  it('renders the observation setup section', () => {
    render(<App />)

    expect(screen.getByText(/observation setup/i)).toBeInTheDocument()
  })

  it('renders the weather service panel with live data context', () => {
    render(<App />)

    expect(screen.getByText(/weather service/i)).toBeInTheDocument()
    expect(screen.getByText(/live weather data/i)).toBeInTheDocument()
  })

  it('shows the current time in the app header', () => {
    render(<App />)

    expect(screen.getByText(/current time/i)).toBeInTheDocument()
  })

  it('shows the live auto-refresh status for data updates', () => {
    render(<App />)

    expect(screen.getByText(/auto-refresh/i)).toBeInTheDocument()
  })

  it('offers a manual refresh action for live data', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /refresh now/i })).toBeInTheDocument()
  })

  it('surfaces mode, weather, and astronomy details in the sky scene', async () => {
    render(<App />)

    expect(await screen.findByText(/mode:/i)).toBeInTheDocument()
    expect(screen.getByText(/weather:/i)).toBeInTheDocument()
    expect(screen.getByText(/astronomy:/i)).toBeInTheDocument()
  })

  it('renders the voice controls entry point', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /start listening/i })).toBeInTheDocument()
  })

  it('shows a tooltip overlay for star labels on hover', () => {
    render(<SkyScene />)

    const siriusButton = screen.getByRole('button', { name: /sirius/i })
    fireEvent.mouseEnter(siriusButton)

    expect(screen.getByRole('tooltip')).toHaveTextContent(/sirius/i)
  })
})
