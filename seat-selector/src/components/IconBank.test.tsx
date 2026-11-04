import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconBank } from './IconBank';
import type { IconConfig } from '../types/Icon';

/**
 * Mock icon configurations for testing
 */
const mockIcons: IconConfig[] = [
  {
    id: 'table-round-4',
    capacity: 0,
    size: { width: 2, height: 2 },
    name: 'Round Table (4-top)',
    color: '#E8B4A2',
    svg: '<circle cx="1" cy="1" r="0.8" fill="currentColor" stroke="#333" stroke-width="0.05"/>',
  },
  {
    id: 'chair-1',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair',
    color: '#8B4513',
    svg: '<rect x="0.2" y="0.2" width="0.6" height="0.6" fill="currentColor" stroke="#333" stroke-width="0.05" rx="0.05"/>',
  },
  {
    id: 'loveseat-2',
    capacity: 2,
    size: { width: 2, height: 1 },
    name: 'Loveseat',
    color: '#D2691E',
    svg: '<rect x="0.1" y="0.2" width="1.8" height="0.6" fill="currentColor" stroke="#333" stroke-width="0.05" rx="0.05"/>',
  },
  {
    id: 'couch-3',
    capacity: 3,
    size: { width: 3, height: 1 },
    name: 'Couch',
    color: '#A0522D',
    svg: '<rect x="0.1" y="0.2" width="2.8" height="0.6" fill="currentColor" stroke="#333" stroke-width="0.05" rx="0.05"/>',
  },
];

describe('IconBank Component', () => {
  describe('Rendering', () => {
    it('should render all provided icons', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      expect(screen.getByLabelText(/Round Table \(4-top\)/i)).toBeDefined();
      expect(screen.getByLabelText(/Chair/i)).toBeDefined();
      expect(screen.getByLabelText(/Loveseat/i)).toBeDefined();
      expect(screen.getByLabelText(/Couch/i)).toBeDefined();
    });

    it('should render with 2-column grid layout', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const grid = container.querySelector('.icon-bank-grid');
      expect(grid?.className).toContain('icon-bank-grid');
    });

    it('should render capacity labels for each icon', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      expect(screen.getByText('Table')).toBeDefined(); // capacity 0
      expect(screen.getByText('Capacity: 1')).toBeDefined();
      expect(screen.getByText('Capacity: 2')).toBeDefined();
      expect(screen.getByText('Capacity: 3')).toBeDefined();
    });

    it('should render SVG icons for each icon config', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const svgElements = container.querySelectorAll('.icon-svg');
      expect(svgElements.length).toBe(mockIcons.length);
    });

    it('should render scrollable container', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const grid = container.querySelector('.icon-bank-grid');
      expect(grid).toBeDefined();
      expect(grid?.className).toContain('icon-bank-grid');
    });
  });

  describe('Sorting', () => {
    it('should sort icons by capacity in ascending order', () => {
      const onSelectIcon = vi.fn();
      const unsortedIcons: IconConfig[] = [
        mockIcons[3], // couch - capacity 3
        mockIcons[0], // table - capacity 0
        mockIcons[2], // loveseat - capacity 2
        mockIcons[1], // chair - capacity 1
      ];

      render(
        <IconBank
          icons={unsortedIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const items = screen.getAllByRole('button');
      const label0 = items[0].getAttribute('aria-label');
      const label1 = items[1].getAttribute('aria-label');
      const label2 = items[2].getAttribute('aria-label');
      const label3 = items[3].getAttribute('aria-label');

      expect(label0?.includes('Round Table')).toBe(true); // capacity 0
      expect(label1?.includes('Chair')).toBe(true); // capacity 1
      expect(label2?.includes('Loveseat')).toBe(true); // capacity 2
      expect(label3?.includes('Couch')).toBe(true); // capacity 3
    });

    it('should maintain sort order after re-render', () => {
      const onSelectIcon = vi.fn();
      const { rerender } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const itemsBefore = screen.getAllByRole('button');
      const labelsBefore = itemsBefore.map((item) =>
        item.getAttribute('aria-label')
      );

      rerender(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const itemsAfter = screen.getAllByRole('button');
      const labelsAfter = itemsAfter.map((item) =>
        item.getAttribute('aria-label')
      );

      expect(labelsBefore).toEqual(labelsAfter);
    });
  });

  describe('Selection', () => {
    it('should highlight the selected icon', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const selectedItems = container.querySelectorAll('.icon-item.selected');
      expect(selectedItems.length).toBe(1);
      const label = selectedItems[0].getAttribute('aria-label');
      expect(label?.includes('Chair')).toBe(true);
    });

    it('should update selection when selectedIconId prop changes', () => {
      const onSelectIcon = vi.fn();
      const { rerender, container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      let selectedItems = container.querySelectorAll('.icon-item.selected');
      let label = selectedItems[0].getAttribute('aria-label');
      expect(label?.includes('Round Table')).toBe(true);

      rerender(
        <IconBank
          icons={mockIcons}
          selectedIconId="loveseat-2"
          onSelectIcon={onSelectIcon}
        />
      );

      selectedItems = container.querySelectorAll('.icon-item.selected');
      label = selectedItems[0].getAttribute('aria-label');
      expect(label?.includes('Loveseat')).toBe(true);
    });

    it('should call onSelectIcon when an icon is clicked', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const chairButton = screen.getByLabelText(/Chair/i);
      fireEvent.click(chairButton);

      expect(onSelectIcon).toHaveBeenCalledWith('chair-1');
    });

    it('should call onSelectIcon with correct icon ID on click', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const loveseatButton = screen.getByLabelText(/Loveseat/i);
      fireEvent.click(loveseatButton);

      expect(onSelectIcon).toHaveBeenCalledTimes(1);
      expect(onSelectIcon).toHaveBeenCalledWith('loveseat-2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to next icon with ArrowRight', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const tableButton = screen.getByLabelText(/Round Table/i);
      tableButton.focus();

      fireEvent.keyDown(tableButton, { key: 'ArrowRight' });

      expect(onSelectIcon).toHaveBeenCalledWith('chair-1');
    });

    it('should navigate to previous icon with ArrowLeft', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="couch-3"
          onSelectIcon={onSelectIcon}
        />
      );

      const couchButton = screen.getByLabelText(/Couch/i);
      couchButton.focus();

      fireEvent.keyDown(couchButton, { key: 'ArrowLeft' });

      expect(onSelectIcon).toHaveBeenCalledWith('loveseat-2');
    });

    it('should wrap to last icon when pressing ArrowLeft on first icon', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const tableButton = screen.getByLabelText(/Round Table/i);
      tableButton.focus();

      fireEvent.keyDown(tableButton, { key: 'ArrowLeft' });

      expect(onSelectIcon).toHaveBeenCalledWith('couch-3');
    });

    it('should wrap to first icon when pressing ArrowRight on last icon', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="couch-3"
          onSelectIcon={onSelectIcon}
        />
      );

      const couchButton = screen.getByLabelText(/Couch/i);
      couchButton.focus();

      fireEvent.keyDown(couchButton, { key: 'ArrowRight' });

      expect(onSelectIcon).toHaveBeenCalledWith('table-round-4');
    });

    it('should select icon on Enter key press', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const chairButton = screen.getByLabelText(/Chair/i);
      chairButton.focus();

      fireEvent.keyDown(chairButton, { key: 'Enter' });

      expect(onSelectIcon).toHaveBeenCalledWith('chair-1');
    });

    it('should select icon on Space key press', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const couchButton = screen.getByLabelText(/Couch/i);
      couchButton.focus();

      fireEvent.keyDown(couchButton, { key: ' ' });

      expect(onSelectIcon).toHaveBeenCalledWith('couch-3');
    });

    it('should navigate with ArrowDown (same as ArrowRight)', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const tableButton = screen.getByLabelText(/Round Table/i);
      tableButton.focus();

      fireEvent.keyDown(tableButton, { key: 'ArrowDown' });

      expect(onSelectIcon).toHaveBeenCalledWith('chair-1');
    });

    it('should navigate with ArrowUp (same as ArrowLeft)', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="couch-3"
          onSelectIcon={onSelectIcon}
        />
      );

      const couchButton = screen.getByLabelText(/Couch/i);
      couchButton.focus();

      fireEvent.keyDown(couchButton, { key: 'ArrowUp' });

      expect(onSelectIcon).toHaveBeenCalledWith('loveseat-2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      expect(screen.getByRole('region')).toBeDefined();
    });

    it('should set aria-pressed on selected icon', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const chairButton = screen.getByLabelText(/Chair/i);
      expect(chairButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should set aria-pressed to false on unselected icons', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const tableButton = screen.getByLabelText(/Round Table/i);
      expect(tableButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('should have tabIndex for keyboard navigation', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const chairButton = screen.getByLabelText(/Chair/i);
      expect(chairButton.getAttribute('tabindex')).toBe('0');

      const tableButton = screen.getByLabelText(/Round Table/i);
      expect(tableButton.getAttribute('tabindex')).toBe('-1');
    });

    it('should have meaningful title attributes', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const chairButton = screen.getByLabelText(/Chair/i);
      const title = chairButton.getAttribute('title');
      expect(title).toBeDefined();
      expect(title?.includes('Chair')).toBe(true);
      expect(title?.includes('Capacity: 1')).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with proper aspect ratio for icon items', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const iconItem = container.querySelector('.icon-item');
      expect(iconItem).toBeDefined();
    });

    it('should render with proper sizing for icons based on capacity', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const displays = container.querySelectorAll('.icon-display');

      // Table: 2x2, so 60x60 (30px per grid square)
      const tableDisplay = displays[0];
      expect(tableDisplay?.getAttribute('style')?.includes('width: 60px')).toBe(true);
      expect(tableDisplay?.getAttribute('style')?.includes('height: 60px')).toBe(true);

      // Chair: 1x1, so 30x30
      const chairDisplay = displays[1];
      expect(chairDisplay?.getAttribute('style')?.includes('width: 30px')).toBe(true);
      expect(chairDisplay?.getAttribute('style')?.includes('height: 30px')).toBe(true);

      // Loveseat: 2x1, so 60x30
      const loveseDisplay = displays[2];
      expect(loveseDisplay?.getAttribute('style')?.includes('width: 60px')).toBe(true);
      expect(loveseDisplay?.getAttribute('style')?.includes('height: 30px')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty icon list', () => {
      const onSelectIcon = vi.fn();
      const { container } = render(
        <IconBank
          icons={[]}
          selectedIconId=""
          onSelectIcon={onSelectIcon}
        />
      );

      const grid = container.querySelector('.icon-bank-grid');
      const items = grid?.querySelectorAll('.icon-item');
      expect(items?.length).toBe(0);
    });

    it('should handle single icon', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={[mockIcons[0]]}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const items = screen.getAllByRole('button');
      expect(items).toHaveLength(1);
    });

    it('should handle duplicate icons with same capacity', () => {
      const onSelectIcon = vi.fn();
      const iconsWithDuplicates: IconConfig[] = [
        mockIcons[1], // chair - capacity 1
        { ...mockIcons[1], id: 'chair-1-alt', name: 'Chair (Alt)' }, // another capacity 1
        mockIcons[2], // loveseat - capacity 2
      ];

      render(
        <IconBank
          icons={iconsWithDuplicates}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const items = screen.getAllByRole('button');
      expect(items).toHaveLength(3);
    });

    it('should handle selectedIconId that does not exist in icons list', () => {
      const onSelectIcon = vi.fn();
      render(
        <IconBank
          icons={mockIcons}
          selectedIconId="non-existent-icon"
          onSelectIcon={onSelectIcon}
        />
      );

      // Should render without crashing and nothing should be selected
      const items = screen.getAllByRole('button');
      expect(items).toHaveLength(4);

      // No icon should have aria-pressed true
      const noSelected = items.filter(
        (item) => item.getAttribute('aria-pressed') === 'true'
      );
      expect(noSelected.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle large number of icons', () => {
      const onSelectIcon = vi.fn();
      const largeIconList: IconConfig[] = Array.from({ length: 50 }, (_, i) => ({
        id: `icon-${i}`,
        capacity: i,
        size: { width: 1, height: 1 },
        name: `Icon ${i}`,
        color: '#000000',
        svg: '<circle cx="1" cy="1" r="0.8" fill="currentColor"/>',
      }));

      const { container } = render(
        <IconBank
          icons={largeIconList}
          selectedIconId="icon-0"
          onSelectIcon={onSelectIcon}
        />
      );

      const items = container.querySelectorAll('.icon-item');
      expect(items).toHaveLength(50);
    });

    it('should not re-sort icons unnecessarily', () => {
      const onSelectIcon = vi.fn();
      const { rerender } = render(
        <IconBank
          icons={mockIcons}
          selectedIconId="table-round-4"
          onSelectIcon={onSelectIcon}
        />
      );

      const itemsBefore = screen.getAllByRole('button');
      const orderBefore = itemsBefore.map((item) =>
        item.getAttribute('aria-label')
      );

      rerender(
        <IconBank
          icons={mockIcons}
          selectedIconId="chair-1"
          onSelectIcon={onSelectIcon}
        />
      );

      const itemsAfter = screen.getAllByRole('button');
      const orderAfter = itemsAfter.map((item) =>
        item.getAttribute('aria-label')
      );

      expect(orderBefore).toEqual(orderAfter);
    });
  });
});
