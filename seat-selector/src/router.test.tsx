import { describe, it, expect } from 'vitest';
import { router } from './router';

describe('React Router Setup', () => {
  it('should have a Home route at /', () => {
    const homeRoute = router.routes.find(r => r.path === '/');
    expect(homeRoute).toBeDefined();
    expect((homeRoute as any)?.element).toBeDefined();
  });

  it('should have a SeatCanvas route at /canvas', () => {
    const canvasRoute = router.routes.find(r => r.path === '/canvas');
    expect(canvasRoute).toBeDefined();
    expect((canvasRoute as any)?.element).toBeDefined();
  });

  it('should have a GuestArrangement route at /arrangement', () => {
    const arrangementRoute = router.routes.find(r => r.path === '/arrangement');
    expect(arrangementRoute).toBeDefined();
    expect((arrangementRoute as any)?.element).toBeDefined();
  });

  it('should have all required routes configured', () => {
    expect(router.routes.length).toBe(3);
  });
});
