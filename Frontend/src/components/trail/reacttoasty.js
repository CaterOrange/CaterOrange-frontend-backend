// ExampleComponent.js
import React from 'react';
import { toast } from 'react-toastify';

function ExampleComponent() {
  const notify = () => {
    toast.success('This is a success message!');
    toast.error('This is an error message!');
    toast.info('This is an info message!');
    toast.warn('This is a warning message!');
  };

  return (
    <div>
      <button onClick={notify}>Show Toasts</button>
    </div>
  );
}

export default ExampleComponent;
