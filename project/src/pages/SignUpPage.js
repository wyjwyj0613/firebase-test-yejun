// src/pages/SignUpPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { auth } from '../firebase'; 
import Button from '../components/Button'; // 🚨 경로 확인
import InputField from '../components/InputField'; // 🚨 경로 확인

// 인라인 스타일을 사용한다고 가정하고 다시 작성합니다. (AuthStyles 의존성 제거)

function SignUpPage () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 🚨 비밀번호 재확인 필드 추가
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [nickname, setNickname] = useState(''); 
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

    const handleSignUp = async (e) => {
        e.preventDefault(); 
        
        if (password.length < 6) {
            alert('비밀번호는 최소 6자리 이상이어야 합니다.');
            return;
        }

        // 🚨 비밀번호 일치 여부 확인 로직
        if (password !== confirmPassword) {
            alert('입력하신 두 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: nickname });

            alert(`${nickname}님, 회원가입에 성공했습니다!`);
            navigate('/home'); 
            
        } catch (error) {
            console.error("회원가입 오류:", error);
            let userMessage = "회원가입 실패: 이메일이 이미 사용 중이거나 유효하지 않습니다.";
            alert(userMessage);
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', color: '#6a0dad', marginBottom: '35px', fontSize: '1.8em', fontWeight: '700' }}>OneQ 회원가입</h2>
            
            <form onSubmit={handleSignUp}>
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
                    placeholder="6자리 이상"
                    required
                />
                {/* 🚨 비밀번호 재확인 InputField */}
                <InputField 
                    label="비밀번호 재확인"
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 한 번 입력해주세요"
                    required
                />
                <InputField 
                    label="닉네임"
                    type="text" 
                    value={nickname} 
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="활동명"
                    required
                />

                <Button type="submit" primary style={{ width: '100%', marginTop: '30px' }}>
                    회원가입
                </Button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9em', color: '#777' }}>
                이미 계정이 있나요? {' '}
                <Link to="/signin" style={{ color: '#6a0dad', textDecoration: 'none', fontWeight: '600' }}>
                    로그인하기
                </Link>
            </div>
        </div>
    );
}

export default SignUpPage;