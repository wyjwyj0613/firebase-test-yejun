// src/pages/MyQuestionStatusPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase'; 
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'; 
import Button from '../components/Button'; 

const styles = {
    container: { 
        maxWidth: '700px', 
        margin: 'auto', 
        padding: '20px 0 80px 0', 
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
    },
    header: {
        color: '#333', 
        borderBottom: '2px solid #6A0DAD', 
        paddingBottom: '10px', 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 20px',
    },
    title: {
        fontSize: '1.8em',
        margin: 0,
        fontWeight: 'bold',
    },
    statusList: {
        listStyle: 'none', 
        padding: '0 20px',
    },
    statusItem: (isHovered) => ({
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '15px',
        backgroundColor: isHovered ? '#fff' : 'white', 
        cursor: 'pointer',
        transition: 'background-color 0.2s, box-shadow 0.2s',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
    }),
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
    },
    questionTitle: {
        fontSize: '1.1em',
        fontWeight: '600',
        color: '#333',
        margin: '0',
        flex: 1,
    },
    metaBox: {
        display: 'flex',
        gap: '15px',
        fontSize: '0.9em',
        color: '#6A0DAD', 
        fontWeight: 'bold',
        paddingTop: '5px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
    },
    dateText: {
        fontSize: '0.85em',
        color: '#999',
        fontWeight: 'normal',
        marginTop: '5px',
    }
};


function MyQuestionStatusPage () { 
    const navigate = useNavigate();
    const [myQuestions, setMyQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);
    // auth.currentUser는 컴포넌트 렌더링 시점에 null일 수 있으므로, useEffect 내부에서 사용하는 것이 안전합니다.
    const currentUser = auth.currentUser;

    // 현재 로그인한 사용자가 작성한 질문만 실시간으로 불러오는 로직
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'questions'),
            // 질문 문서에 저장된 필드명에 따라 'uid' 또는 'userId'를 사용합니다.
            // 현재 코드에서는 'userId'를 사용하고 있으므로 그대로 유지합니다.
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedQuestions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                answerCount: doc.data().answerCount || 0,
                // ✅ 수정된 부분: DB 필드명 'likes'를 읽어와서 'questionLikes' 변수에 할당합니다.
                questionLikes: doc.data().likes || 0, 
                createdAt: doc.data().createdAt?.toDate().toLocaleString('ko-KR') || '방금 전'
            }));
            
            setMyQuestions(fetchedQuestions);
            setLoading(false);
        }, (error) => {
            console.error("내 질문 로드 중 오류 발생:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]); // currentUser가 변경될 때마다 실행

    
    // 로그인 안 했을 때 보호 화면
    if (!currentUser) {
         return (
             <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
                 <h2 style={{ color: '#6A0DAD' }}>로그인이 필요합니다.</h2>
                 <p>내 질문 상태를 확인하려면 로그인해 주세요.</p>
                 <Button primary onClick={() => navigate('/signin')} style={{ marginTop: '20px' }}>
                    로그인 페이지로
                 </Button>
             </div>
         );
    }


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    {currentUser.displayName || '익명'}'s 질문 상태
                </h2>
                <Button onClick={() => navigate('/home')}>
                    홈으로
                </Button>
            </div>
            
            <p style={{ padding: '0 20px', color: '#555', marginBottom: '15px' }}>
                * 내가 작성한 질문들의 답변 수와 **게시물 좋아요** 수를 한눈에 확인하세요.
            </p>

            {loading ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>내 질문 목록 로드 중...</p>
            ) : myQuestions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '30px', marginTop: '30px' }}>
                    아직 작성한 질문이 없습니다. 첫 질문을 올려보세요!
                </p>
            ) : (
                <ul style={styles.statusList}>
                    {myQuestions.map(q => (
                        <li 
                            key={q.id} 
                            onClick={() => navigate(`/question/${q.id}`)} 
                            onMouseEnter={() => setHoveredId(q.id)} 
                            onMouseLeave={() => setHoveredId(null)} 
                            style={styles.statusItem(hoveredId === q.id)}
                        >
                            <div style={styles.itemHeader}>
                                <h3 style={styles.questionTitle}>{q.title}</h3>
                            </div>
                            
                            <div style={styles.metaBox}>
                                <div style={styles.metaItem}>
                                    <span style={{ marginRight: '5px', color: '#6A0DAD' }}>📝</span>
                                    <span>답변 수: {q.answerCount}개</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={{ marginRight: '5px', color: '#007BFF' }}>👍</span>
                                    {/* 게시물 좋아요(questionLikes) 표시 */}
                                    <span>게시물 좋아요: {q.questionLikes}개</span> 
                                </div>
                            </div>
                            <small style={styles.dateText}>
                                작성일: {q.createdAt}
                            </small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyQuestionStatusPage;