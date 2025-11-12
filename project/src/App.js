// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; 

// 페이지 컴포넌트 임포트 (경로: ./pages/파일명)
import LandingPage from './pages/LandingPage';         
import SignUpPage from './pages/SignUpPage';           
import SignInPage from './pages/SignInPage';           
import PasswordResetPage from './pages/PasswordResetPage'; 
import MainPage from './pages/MainPage';               
import QuestionWritePage from './pages/QuestionWritePage'; 
import QuestionDetailPage from './pages/QuestionDetailPage'; 
// 🚨🚨🚨 임포트 이름과 파일명을 'MyQuestionStatusPage'로 통일하여 명확성을 높였습니다. 
import MyQuestionStatusPage from './pages/MyQuestionStatusPage';       
import SettingPage from './pages/SettingPage';         


// 🚨 로그인 상태를 확인하고 메인 페이지로 자동 이동시키는 핵심 컴포넌트
const AuthChecker = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // 로그인 되어 있으면 즉시 /home으로 이동
                navigate('/home', { replace: true });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <div style={{ textAlign: 'center', paddingTop: '100px' }}>로딩 중...</div>;
    }
    
    // 로그인 상태가 아니면 라우트된 자식 페이지(랜딩/로그인/회원가입)를 표시
    return children;
};


function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Pretendard, Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Routes>
          {/* 인증 페이지는 AuthChecker로 감싸 로그인 상태를 체크합니다. */}
          <Route path="/" element={<AuthChecker><LandingPage /></AuthChecker>} /> 
          <Route path="/signup" element={<AuthChecker><SignUpPage /></AuthChecker>} />
          <Route path="/signin" element={<AuthChecker><SignInPage /></AuthChecker>} /> 
          <Route path="/reset-password" element={<AuthChecker><PasswordResetPage /></AuthChecker>} />
          
          {/* 주요 서비스 페이지 */}
          <Route path="/home" element={<MainPage />} />
          <Route path="/write" element={<QuestionWritePage />} />
          <Route path="/question/:id" element={<QuestionDetailPage />} />
          {/* 🚨🚨🚨 '내 질문상태' 경로와 컴포넌트를 연결합니다. */}
          <Route path="/my-questions" element={<MyQuestionStatusPage />} /> 
          <Route path="/settings" element={<SettingPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
