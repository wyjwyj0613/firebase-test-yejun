// src/pages/WritePage.js
// ✅ 좋아요/싫어요 초기값을 0으로 명시적으로 설정

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Button from '../components/Button'; 

const styles = {
    container: { 
        maxWidth: '600px', 
        margin: 'auto', 
        padding: '20px', 
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
    },
    header: {
        color: '#333',
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #6A0DAD',
        paddingBottom: '10px',
    },
    form: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    },
    label: {
        display: 'block',
        fontSize: '1em',
        color: '#555',
        marginBottom: '8px',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '20px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '1em',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        marginBottom: '20px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '1em',
        resize: 'vertical',
        minHeight: '150px',
        boxSizing: 'border-box',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    }
};

function WritePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !currentUser) {
            alert(currentUser ? "제목과 내용을 모두 입력해 주세요." : "로그인이 필요합니다.");
            return;
        }

        try {
            await addDoc(collection(db, "questions"), {
                title: title,
                content: content,
                userId: currentUser.uid,
                userName: currentUser.displayName || '익명',
                createdAt: serverTimestamp(),
                answerCount: 0,
                viewCount: 0,
                // ✅ 핵심: 좋아요/싫어요 초기값을 0으로 명시
                likes: 0, 
                dislikes: 0,
            });

            setTitle('');
            setContent('');
            alert("질문이 성공적으로 등록되었습니다!");
            navigate('/home');

        } catch (error) {
            console.error("질문 등록 오류:", error);
            alert("질문 등록에 실패했습니다.");
        }
    };

    if (!currentUser) {
        return (
            <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
                <h2 style={{ color: '#6A0DAD' }}>로그인이 필요합니다.</h2>
                <p>질문을 작성하려면 로그인해 주세요.</p>
                <Button primary onClick={() => navigate('/signin')} style={{ marginTop: '20px' }}>
                    로그인 페이지로
                </Button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>새 질문 작성하기</h1>
            <form style={styles.form} onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title" style={styles.label}>제목</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="질문의 제목을 입력하세요."
                        style={styles.input}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" style={styles.label}>내용</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="자세한 질문 내용을 입력하세요."
                        style={styles.textarea}
                        rows="10"
                        required
                    />
                </div>
                <div style={styles.buttonContainer}>
                    <Button type="button" onClick={() => navigate('/home')}>
                        취소
                    </Button>
                    <Button primary type="submit" disabled={!title.trim() || !content.trim()}>
                        질문 등록
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default WritePage;