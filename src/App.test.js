import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('react-particles-js', () => () => <div data-testid="particles-mock" />);

jest.mock('clarifai', () => ({
  App: jest.fn(() => ({
    models: {
      predict: jest.fn(() => Promise.resolve({
        outputs: [{
          data: {
            regions: [{
              region_info: {
                bounding_box: {
                  top_row: 0.1,
                  left_col: 0.2,
                  right_col: 0.3,
                  bottom_row: 0.4
                }
              }
            }]
          }
        }]
      }))
    }
  })),
  FACE_DETECT_MODEL: 'face-detect-model'
}));

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    const user = { id: '123', name: 'Test User', email: 'test@example.com', entries: 0, joined: new Date() };
    if (url.includes('/signin')) {
      return Promise.resolve({
        json: () => Promise.resolve(user),
      });
    }
    if (url.includes('/register')) {
      return Promise.resolve({
        json: () => Promise.resolve(user),
      });
    }
    if (url.includes('/image')) {
      return Promise.resolve({
        json: () => Promise.resolve({ entries: 1 }),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});

describe('App component routing and user flow', () => {
  it('should render the Signin component by default', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should navigate to the Register component when the "Register" link is clicked', async () => {
    render(<App />);
    const registerLink = screen.getByText('Register', { selector: 'p.f6' });
    fireEvent.click(registerLink);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });
  });

  it('should navigate to the Home screen on successful sign-in', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByDisplayValue(/sign in/i));

    await waitFor(() => {
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });
  });

  it('should sign out and return to the signin page', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByDisplayValue(/sign in/i));

    const signOutButton = await screen.findByText(/sign out/i);
    fireEvent.click(signOutButton);

    const signInHeading = await screen.findByRole('heading', { name: /sign in/i });
    expect(signInHeading).toBeInTheDocument();
  });
});

describe('calculateFaceLocation', () => {
  it('should calculate the face location correctly', () => {
    const appInstance = new App();
    const mockData = {
      outputs: [
        {
          data: {
            regions: [
              {
                region_info: {
                  bounding_box: {
                    top_row: 0.1,
                    left_col: 0.2,
                    right_col: 0.3,
                    bottom_row: 0.4,
                  },
                },
              },
            ],
          },
        },
      ],
    };

    global.document.getElementById = jest.fn(() => ({
      width: 500,
      height: 300,
    }));

    const result = appInstance.calculateFaceLocation(mockData);

    expect(result).toEqual({
      leftCol: 100,
      topRow: 30,
      rightCol: 350,
      bottomRow: 180,
    });
  });

  it('should call the API and update state on picture submission', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByDisplayValue(/sign in/i));

    await waitFor(() => {
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });

    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'https://example.com/image.jpg' } });

    const submitButton = screen.getByRole('button', { name: /detect/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/image', expect.any(Object));
      expect(screen.getByText(/Test User, your current rank is/i)).toBeInTheDocument();
    });
  });
});
