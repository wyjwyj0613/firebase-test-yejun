// src/pages/MainPage.js (최종 버전: 조회수 추가)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import Button from '../components/Button'; 


const styles = {
    container: { 
        maxWidth: '800px', 
        margin: 'auto', 
        padding: '20px 0 80px 0', 
        minHeight: '100vh',
    },
    todayQuestion: { 
        backgroundColor: '#fff',
        padding: '40px',
        margin: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
    },
    questionText: {
        fontSize: '1.8em',
        fontWeight: '700',
        color: '#333',
        marginBottom: '30px',
    },
    listSection: {
        padding: '0 20px', 
        marginTop: '40px' 
    },
    questionItem: (isHovered) => ({
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
        marginBottom: '15px',
        backgroundColor: isHovered ? '#f0f0ff' : 'white', 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
    }),
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    itemTitle: {
        fontSize: '1.2em',
        fontWeight: '600',
        margin: '0',
        color: '#333',
    },
    itemContent: {
        fontSize: '0.95em',
        color: '#666',
        marginBottom: '10px',
    },
    itemMeta: {
        fontSize: '0.8em',
        color: '#999',
    },
    netScoreCount: (netScore) => ({
        display: 'flex',
        alignItems: 'center',
        color: netScore < 0 ? '#DC3545' : (netScore === 0 ? '#333' : '#007BFF'), 
        fontWeight: 'bold',
        fontSize: '1em',
    }),
    bottomNav: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        maxWidth: '800px', 
        height: '60px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    navItem: (isActive) => ({
        color: isActive ? '#6A0DAD' : '#999',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
        fontSize: '0.9em',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }),
};


function MainPage () {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);
    const [activeTab] = useState('home'); 
    const [sortCriterion, setSortCriterion] = useState('latest'); 

    
    // 실시간 데이터 로드 로직
    useEffect(() => {
        let q;
        if (sortCriterion === 'popular') {
            q = query(collection(db, 'questions'), orderBy('likes', 'desc'), orderBy('createdAt', 'desc'));
        } else {
            q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedQuestions = snapshot.docs.map(doc => {
                const data = doc.data();
                const likes = data.likes || 0;
                const dislikes = data.dislikes || 0;

                return {
                    id: doc.id,
                    ...data,
                    likes: likes,
                    dislikes: dislikes,
                    netScore: likes - dislikes, 
                    answerCount: data.answerCount || 0,
                    // ✅ viewCount를 데이터에 추가
                    viewCount: data.viewCount || 0, 
                    createdAt: data.createdAt?.toDate().toLocaleString('ko-KR') || '방금 전'
                }
            });
            
            setQuestions(fetchedQuestions);
            setLoading(false);
        }, (error) => {
            console.error("질문 실시간 로드 중 오류 발생:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sortCriterion]); 

    const handleLogout = async () => {
        await auth.signOut();
        alert("로그아웃되었습니다.");
        navigate('/');
    };
    
    // 내비게이션 아이템
    const navItems = [
        { name: 'Home', path: '/home' },
        { name: '내 질문상태', path: '/my-questions' }, 
        { name: 'Settings', path: '/settings' },
    ];

    return (
        <div style={{...styles.container, backgroundColor: '#f9f9f9'}}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 15px' }}>
                <Button onClick={handleLogout}>로그아웃</Button>
            </div>
            
            <div style={styles.todayQuestion}>
                <p style={{ color: '#6A0DAD', fontSize: '1.2em', marginBottom: '10px' }}>오늘의 질문</p>
                <p style={styles.questionText}>
                    "당신이 개발한 가장 자랑스러운 기능은 무엇이며, 그 이유는?"
                </p>
                
                <Button primary onClick={() => navigate('/write')}>
                    오늘의 질문에 답하고 싶다면 시작하기
                </Button>
            </div>

            <div style={styles.listSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>
                        전체 질문 목록 ({questions.length}개)
                    </h3>
                    
                    {/* 정렬 버튼 */}
                    <div>
                        <button 
                            style={{ 
                                padding: '5px 10px', 
                                border: 'none', 
                                backgroundColor: sortCriterion === 'latest' ? '#6A0DAD' : '#f0f0f0', 
                                color: sortCriterion === 'latest' ? 'white' : '#333', 
                                borderRadius: '4px 0 0 4px', 
                                cursor: 'pointer' 
                            }}
                            onClick={() => setSortCriterion('latest')}
                        >
                            최신순
                        </button>
                        <button 
                             style={{ 
                                padding: '5px 10px', 
                                border: 'none', 
                                backgroundColor: sortCriterion === 'popular' ? '#6A0DAD' : '#f0f0f0', 
                                color: sortCriterion === 'popular' ? 'white' : '#333', 
                                borderRadius: '0 4px 4px 0', 
                                cursor: 'pointer' 
                            }}
                            onClick={() => setSortCriterion('popular')}
                        >
                            인기순
                        </button>
                    </div>
                </div>
                
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>질문 로드 중...</p>
                ) : questions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>아직 등록된 질문이 없습니다.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {questions.map(q => (
                            <li 
                                key={q.id} 
                                onClick={() => navigate(`/question/${q.id}`)} 
                                onMouseEnter={() => setHoveredId(q.id)} 
                                onMouseLeave={() => setHoveredId(null)} 
                                style={styles.questionItem(hoveredId === q.id)}
                            >
                                <div style={styles.itemHeader}>
                                    <h3 style={styles.itemTitle}>{q.title}</h3>
                                    <span style={styles.netScoreCount(q.netScore)}>
                                        {q.netScore > 0 ? `+${q.netScore}` : q.netScore} 
                                    </span>
                                </div>
                                <p style={styles.itemContent}>
                                    {q.content.substring(0, 80)}...
                                </p>
                                <small style={styles.itemMeta}>
                                    작성자: {q.userName || '익명'} | 답변 {q.answerCount || 0}개 | 조회수 {q.viewCount || 0}회 | {q.createdAt}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>


            {/* 하단 내비게이션 바 */}
            <div style={styles.bottomNav}>
                {navItems.map((item) => (
                    <div 
                        key={item.name} 
                        style={styles.navItem(item.name.toLowerCase() === activeTab)}
                        onClick={() => navigate(item.path)}
                    >
                        {item.name === 'Home' ? '🏠 Home' : item.name} 
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MainPage;