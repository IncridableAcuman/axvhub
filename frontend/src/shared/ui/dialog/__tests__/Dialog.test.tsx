import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '../Dialog'
import { ConfirmDialog } from '../ConfirmDialog'

describe('Dialog and ConfirmDialog components', () => {
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
})
