// src/pages/LandingPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage () {
  const navigate = useNavigate();

  // 1. 메인 버튼 스타일
  const primaryButtonStyle = {
    padding: '16px 40px', // 패딩 증가
    fontSize: '1.4em', // 폰트 크기 증가
    border: 'none',
    borderRadius: '10px', // 모서리 둥글게
    cursor: 'pointer',
    fontWeight: '700', // 굵은 폰트
    backgroundColor: '#6A0DAD', // 보라색
    color: 'white',
    transition: 'background-color 0.3s, transform 0.2s', // 트랜지션 추가
    boxShadow: '0 8px 20px rgba(106, 13, 173, 0.4)', // 그림자 강화
    marginTop: '60px',
  };

  // 2. 상단 버튼 스타일
  const headerButtonStyle = {
    padding: '10px 20px',
    fontSize: '1em',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#333',
    fontWeight: '500',
    transition: 'color 0.2s',
  };

  // 3. 상단 회원가입 버튼 스타일
  const signUpButtonStyle = {
    ...headerButtonStyle, // 기본 스타일 상속
    border: '2px solid #6A0DAD', // 보라색 테두리 추가
    backgroundColor: '#6A0DAD',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '700',
    boxShadow: '0 2px 5px rgba(106, 13, 173, 0.2)',
  };

  // 4. 메인 타이틀 스타일
  const mainTitleStyle = {
    fontSize: '3.5em', // 크기 증가
    margin: '0',
    color: '#333',
    fontWeight: '300', // 얇은 폰트
    letterSpacing: '2px', // 간격 추가
  };

  // 5. 강조 로고 스타일
  const logoStyle = {
    fontSize: '6em', // 더욱 크게
    margin: '10px 0 30px',
    color: '#6A0DAD', // 보라색 유지
    fontWeight: '900', // 가장 굵게
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)', // 텍스트 그림자
  };
  
  // 6. 부제목 스타일
  const subtitleStyle = {
      fontSize: '1.4em',
      color: '#555',
      fontWeight: '400',
      marginBottom: '40px',
  };

  return (
    <div style={{ 
        textAlign: 'center', 
        paddingTop: '180px', // 여백 증가
        minHeight: '100vh', 
        backgroundColor: '#f9f9f9', // 배경색 약간 변경
        fontFamily: 'Arial, sans-serif' // 폰트 추가
    }}>
      <header style={{ 
          position: 'fixed', 
          top: 0, 
          width: '100%', 
          padding: '20px 0', // 패딩 증가
          backgroundColor: 'white', 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', // 헤더 그림자 추가
          zIndex: 100 // 다른 요소 위에 오도록 설정
      }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
             {/* 왼쪽 로고 영역 */}
             <div style={{ float: 'left', fontWeight: 'bold', color: '#6A0DAD', fontSize: '1.5em', cursor: 'pointer' }}
                  onClick={() => navigate('/home')}>
                OneQ
             </div>
             {/* 상단 로그인/회원가입 버튼 */}
             <div style={{ float: 'right', gap: '10px', display: 'flex', alignItems: 'center' }}>
                  <button 
                      style={headerButtonStyle} 
                      onClick={() => navigate('/signin')}
                  >
                      로그인
                  </button>
                  <button 
                      style={signUpButtonStyle} 
                      onClick={() => navigate('/signup')}
                  >
                      회원가입
                  </button>
              </div>
              <div style={{ clear: 'both' }}></div> {/* float 해제 */}
          </div>
      </header>
      
      <h1 style={mainTitleStyle}>하루에 하나의 질문</h1>
      <h2 style={logoStyle}>OneQ</h2>
      
      <p style={subtitleStyle}>개발 질문을 나누고, 함께 성장하는 커뮤니티</p>
      
      {/* 시작하기 버튼 */}
      <button 
          style={primaryButtonStyle}
          onClick={() => navigate('/signup')} 
          // 🚨 호버 효과를 위한 인라인 이벤트 핸들러 추가 (CSS 파일이 없으므로)
          onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#580894';
              e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6A0DAD';
              e.currentTarget.style.transform = 'translateY(0)';
          }}
      >
          OneQ 시작하기
      </button>

    </div>
  );
}

export default LandingPage;