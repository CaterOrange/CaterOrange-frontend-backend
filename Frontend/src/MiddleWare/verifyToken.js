import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

export function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);

    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      console.log(currentTime,decoded.exp);
      return decoded.exp < currentTime; // Token is expired if `exp` is less than the current time
    }
    
    return true; // If no `exp` claim is present, consider the token expired
  } catch (error) {
    console.error('Invalid token:', error);
    return true; // Consider the token expired if it cannot be decoded
  }
}
export function VerifyToken(){
 useEffect(() => {
  const token = localStorage.getItem('token');

  if (token && isTokenExpired(token)) {
    console.log('Token is expired. Redirecting to login...');
    localStorage.clear();
    window.location.href = '/'; // Redirect to the login page
  } 
  else if(!token){
    window.location.href = '/';
  }
  else {
    console.log('Token is valid.');
  }
}, []);
return ;
}