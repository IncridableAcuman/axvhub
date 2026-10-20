import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '../Dialog'
import { ConfirmDialog } from '../ConfirmDialog'
import {
  Dialog as RadixDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

describe('Dialog and ConfirmDialog components', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('does not render when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={() => {}}>
        <div>Modal Kontenti</div>
      </Dialog>
    )

    expect(screen.queryByText('Modal Kontenti')).not.toBeInTheDocument()
  })

  it('renders title, description and content when isOpen is true', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        title="Dars Jadvali"
        description="Guruhlar taqsimoti"
      >
        <div>Modal Kontenti</div>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dars Jadvali')).toBeInTheDocument()
    expect(screen.getByText('Guruhlar taqsimoti')).toBeInTheDocument()
    expect(screen.getByText('Modal Kontenti')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Dialog isOpen={true} onClose={handleClose} title="Sarlavha">
        Kontent
      </Dialog>
    )

    const closeBtn = screen.getByLabelText('Yopish')
    await user.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking outside the dialog window (backdrop/overlay)', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Dialog isOpen={true} onClose={handleClose} title="Sarlavha">
        <div>Ichki Kontent</div>
      </Dialog>
    )

    const overlay = screen.getByTestId('dialog-overlay')
    await user.click(overlay)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking inside the dialog window', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Dialog isOpen={true} onClose={handleClose} title="Sarlavha">
        <button type="button">Ichki Tugma</button>
      </Dialog>
    )

    const innerButton = screen.getByRole('button', { name: 'Ichki Tugma' })
    await user.click(innerButton)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when closeOnBackdropClick is false', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Dialog isOpen={true} onClose={handleClose} title="Sarlavha" closeOnBackdropClick={false}>
        <div>Ichki Kontent</div>
      </Dialog>
    )

    const overlay = screen.getByTestId('dialog-overlay')
    await user.click(overlay)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('ConfirmDialog executes onConfirm callback on confirmation button click', async () => {
    const handleConfirm = vi.fn()
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="O‘chirish"
        description="Rostdan ham o‘chirmoqchimisiz?"
        confirmText="Ha, o‘chir"
      />
    )

    const confirmBtn = screen.getByRole('button', { name: /ha, o‘chir/i })
    await user.click(confirmBtn)
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders correctly in light and dark mode for shared Dialog', () => {
    // Light mode
    document.documentElement.setAttribute('data-theme', 'light')
    const { rerender } = render(
      <Dialog isOpen={true} onClose={() => {}} title="Light rejim">
        <div>Light matni</div>
      </Dialog>
    )

    const dialogEl = screen.getByRole('dialog')
    expect(dialogEl).toBeInTheDocument()
    expect(dialogEl.className).toContain('bg-[var(--bg-surface)]')
    expect(dialogEl.className).toContain('text-[var(--text-primary)]')
    expect(dialogEl.className).toContain('border-border')

    // Switch to Dark mode
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')

    rerender(
      <Dialog isOpen={true} onClose={() => {}} title="Dark rejim">
        <div>Dark matni</div>
      </Dialog>
    )

    const darkDialogEl = screen.getByRole('dialog')
    expect(darkDialogEl).toBeInTheDocument()
    expect(darkDialogEl.className).toContain('bg-[var(--bg-surface)]')
    expect(darkDialogEl.className).toContain('text-[var(--text-primary)]')
  })

  it('Radix DialogContent properly carries theme classes (bg-card, text-card-foreground, border-border)', () => {
    // Light mode
    document.documentElement.setAttribute('data-theme', 'light')

    const { rerender } = render(
      <RadixDialog open={true}>
        <DialogContent data-testid="radix-dialog-content">
          <DialogHeader>
            <DialogTitle>Radix Title</DialogTitle>
            <DialogDescription>Radix Desc</DialogDescription>
          </DialogHeader>
          <p>Dialog ichki matni</p>
        </DialogContent>
      </RadixDialog>
    )

    const content = screen.getByTestId('radix-dialog-content')
    expect(content).toBeInTheDocument()
    expect(content.className).toContain('bg-card')
    expect(content.className).toContain('text-card-foreground')
    expect(content.className).toContain('border-border')

    // Dark mode
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')

    rerender(
      <RadixDialog open={true}>
        <DialogContent data-testid="radix-dialog-content">
          <DialogHeader>
            <DialogTitle>Radix Title Dark</DialogTitle>
            <DialogDescription>Radix Desc Dark</DialogDescription>
          </DialogHeader>
          <p>Dialog ichki matni dark</p>
        </DialogContent>
      </RadixDialog>
    )

    const darkContent = screen.getByTestId('radix-dialog-content')
    expect(darkContent).toBeInTheDocument()
    expect(darkContent.className).toContain('bg-card')
    expect(darkContent.className).toContain('text-card-foreground')
    expect(darkContent.className).toContain('border-border')
  })
})
