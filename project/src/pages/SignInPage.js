// src/pages/SignInPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import Button from '../components/Button'; 
import InputField from '../components/InputField'; 


function SignInPage () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const containerStyle = { 
        maxWidth: '420px', 
        margin: '100px auto', 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0'
    };

    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('로그인 성공!');
            navigate('/home'); 
            
        } catch (error) {
            console.error("로그인 오류:", error);
            alert("로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', color: '#6a0dad', marginBottom: '35px', fontSize: '1.8em', fontWeight: '700' }}>OneQ 로그인</h2>
            
            <form onSubmit={handleSignIn}>
                <InputField 
                    label="이메일"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                />
                <InputField 
                    label="비밀번호"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button type="submit" primary style={{ width: '100%', marginTop: '30px' }}>
                    로그인
                </Button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9em' }}>
                <Link to="/reset-password" style={{ color: '#6a0dad', textDecoration: 'none', fontWeight: '600' }}>
                    비밀번호를 잊으셨나요?
                </Link>
            </div>
        </div>
    );
}

export default SignInPage;