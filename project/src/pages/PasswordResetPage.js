// src/pages/PasswordResetPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; 
import Button from '../components/Button'; 
import InputField from '../components/InputField';

function PasswordResetPage () {
    const [email, setEmail] = useState('');
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

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            alert("비밀번호 재설정 이메일이 성공적으로 전송되었습니다. 이메일을 확인하세요.");
            navigate('/signin');
        } catch (error) {
            console.error("비밀번호 재설정 오류:", error);
            alert("비밀번호 재설정 실패: 등록되지 않은 이메일이거나 오류가 발생했습니다.");
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', color: '#6A0DAD', marginBottom: '35px', fontSize: '1.8em', fontWeight: '700' }}>비밀번호 재설정</h2>
            
            <form onSubmit={handleReset}>
                <InputField 
                    label="등록된 이메일"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                    <Button type="button" onClick={() => navigate('/signin')}>
                        취소
                    </Button>
                    <Button type="submit" primary>
                        재설정 이메일 받기
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default PasswordResetPage;