// src/styles/AuthStyles.js

import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const AuthContainer = styled.div`
  max-width: 420px;
  margin: 100px auto;
  padding: 40px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

export const Title = styled.h2`
  text-align: center;
  color: #6a0dad; 
  margin-bottom: 35px;
  font-size: 1.8em;
  font-weight: 700;
`;

export const InputField = styled.input.attrs(props => ({
  type: props.type || 'text',
}))`
  width: 100%;
  padding: 14px 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #6a0dad;
    outline: none;
    box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.2);
  }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #333; 
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
  margin-top: ${props => props.mt || '10px'};
  transition: background-color 0.2s;

  &:hover {
    background-color: #555;
  }
`;

export const StyledLink = styled(Link)`
  color: #6a0dad;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95em;
  transition: color 0.2s;

  &:hover {
    color: #9459d2; 
    text-decoration: underline;
  }
`;

export const FooterText = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 0.9em;
  color: #777;
`;