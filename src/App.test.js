import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    expect(screen.getByDisplayValue(/sign in/i)).toBeInTheDocument();
  });

  it('should navigate to the Register component when the "Register" link is clicked', async () => {
    render(<App />);
    const registerLink = screen.getByText('Register', { selector: 'p.f6' });
    fireEvent.click(registerLink);
    const registerForm = await screen.findByTestId('register-form');
    expect(registerForm).toBeInTheDocument();
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

    const signInButton = await screen.findByDisplayValue(/sign in/i);
    expect(signInButton).toBeInTheDocument();
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
});

describe('App component methods', () => {
  it('should load a user into the state', () => {
    const { container } = render(<App />);
    const appInstance = container.querySelector('.App');
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      entries: 0,
      joined: new Date(),
    };
    // This is not the ideal way to test this, but it's the only way to do it without refactoring the App component
    const app = new App();
    app.setState = jest.fn();
    app.loadUser(mockUser);
    expect(app.setState).toHaveBeenCalledWith({ user: mockUser });
  });

  it('should update the input state on input change', () => {
    const { container } = render(<App />);
    const appInstance = container.querySelector('.App');
    const mockEvent = {
      target: {
        value: 'test input',
      },
    };
    const app = new App();
    app.setState = jest.fn();
    app.onInputChange(mockEvent);
    expect(app.setState).toHaveBeenCalledWith({ input: 'test input' });
  });
});

describe('Image submission and face recognition', () => {
  it('should display the face recognition box on button submit', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByDisplayValue(/sign in/i));

    await waitFor(() => {
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });

    const imageLinkForm = screen.getByTestId('image-link-form');
    const input = within(imageLinkForm).getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://example.com/image.jpg' } });

    const detectButton = within(imageLinkForm).getByRole('button', { name: /detect/i });
    fireEvent.click(detectButton);

    const faceBox = await screen.findByTestId('face-recognition-box');
    expect(faceBox).toBeInTheDocument();
  });
});
