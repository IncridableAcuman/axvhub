import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabList, TabTrigger, TabContent } from '../Tabs'

describe('Tabs component', () => {
  it('renders default tab content and switches tabs on click', async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue="tab1">
        <TabList>
          <TabTrigger value="tab1">1-Bo‘lim</TabTrigger>
          <TabTrigger value="tab2">2-Bo‘lim</TabTrigger>
        </TabList>

        <TabContent value="tab1">
          <div>1-Bo‘lim Kontenti</div>
        </TabContent>
        <TabContent value="tab2">
          <div>2-Bo‘lim Kontenti</div>
        </TabContent>
      </Tabs>
    )

    expect(screen.getByText('1-Bo‘lim Kontenti')).toBeInTheDocument()
    expect(screen.queryByText('2-Bo‘lim Kontenti')).not.toBeInTheDocument()

    const tab2Trigger = screen.getByRole('tab', { name: /2-bo‘lim/i })
    await user.click(tab2Trigger)

    expect(screen.queryByText('1-Bo‘lim Kontenti')).not.toBeInTheDocument()
    expect(screen.getByText('2-Bo‘lim Kontenti')).toBeInTheDocument()
  })
})
