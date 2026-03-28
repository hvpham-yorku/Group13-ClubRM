import { render, fireEvent, waitFor, act, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentsPage } from '../../src/components/documents/documents-page';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const mockChain = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  // single() is required — handleAdd chains .insert().select().single()
  single: vi.fn().mockReturnThis(),
  then: vi.fn((onFulfilled?: any) =>
    Promise.resolve(
      onFulfilled ? onFulfilled({ data: [], error: null }) : { data: [], error: null }
    )
  ),
}));

vi.mock('../../src/lib/supabase', () => ({
  supabaseUntyped: {
    from: vi.fn(() => mockChain),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.pdf' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com' } })),
      })),
    },
  },
}));

vi.mock('../../src/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'u1', user_metadata: { full_name: 'User', organization_id: 'o1' } },
  }),
}));

describe('Documents Integration', () => {
  it('should execute a full upload cycle', async () => {
    render(
      <MemoryRouter>
        <DocumentsPage />
      </MemoryRouter>
    );

    // Open the upload dialog
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    // Radix Dialog renders into a portal on document.body (outside the render
    // container), so use document.querySelector to reach it
    const input = await waitFor(() => {
      const el = document.querySelector('input[type="file"]');
      if (!el) throw new Error("File input not found yet...");
      return el as HTMLInputElement;
    });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    // Selecting a file only updates state (selectedFile + formName) —
    // it does NOT trigger the upload itself
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // The actual upload is triggered by the "Initiate Upload" submit button
    // inside the dialog. The background content is aria-hidden when the modal
    // is open, so only the dialog's button matches this query.
    const submitButton = await waitFor(() =>
      screen.getByRole('button', { name: /initiate upload/i })
    );
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockChain.insert).toHaveBeenCalled();
    });
  });
});