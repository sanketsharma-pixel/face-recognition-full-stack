import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import Clarifai from 'clarifai';

jest.mock('react-particles-js', () => () => <div data-testid="particles-mock" />);

jest.mock('clarifai');

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
    expect(screen.getByText('Sign In', { selector: 'legend' })).toBeInTheDocument();
  });

  it('should navigate to the Register component when the "Register" link is clicked', async () => {
    render(<App />);
    const registerLink = screen.getByText('Register', { selector: 'p.f6' });
    fireEvent.click(registerLink);
    await waitFor(() => {
      expect(screen.getByText('Register', { selector: 'legend' })).toBeInTheDocument();
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

    const signInHeading = await screen.findByText('Sign In', { selector: 'legend' });
    expect(signInHeading).toBeInTheDocument();
  });

  it('should update the input field', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByDisplayValue(/sign in/i));

    await waitFor(() => {
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });

    const imageInput = screen.getByRole('textbox');
    fireEvent.change(imageInput, { target: { value: 'test.jpg' } });
    expect(imageInput.value).toBe('test.jpg');
  });

  it('should detect a face in an image', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByDisplayValue(/sign in/i));

    await waitFor(() => {
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });

    const imageInput = screen.getByRole('textbox');
    fireEvent.change(imageInput, { target: { value: 'test.jpg' } });

    const detectButton = screen.getByText('Detect');
    fireEvent.click(detectButton);

    await waitFor(() => {
      expect(Clarifai.mockPredict).toHaveBeenCalledWith(Clarifai.FACE_DETECT_MODEL, 'test.jpg');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/image', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        id: '123'
        })
      });
      expect(screen.getByText('Test User, your current rank is...')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
