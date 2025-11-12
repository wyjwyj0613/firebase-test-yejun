// src/pages/QuestionDetailPage.js
// ✅ 최종 확정: 'isDisliked' 오타 수정, Enter 키 제출, 컴포넌트 분리, 모든 오류 해결

import React, { useState, useEffect, useRef } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { db, auth } from '../firebase'; 
import { 
    doc, onSnapshot, collection, query, orderBy, 
    addDoc, serverTimestamp, runTransaction, 
    deleteDoc, updateDoc, increment
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Button from '../components/Button'; 


// 1. 좋아요/싫어요 컴포넌트 (외부 정의)
const LikeButtons = ({ 
    isLiked, 
    isDisliked, 
    likesCount, 
    dislikesCount, 
    onLike, 
    onDislike,
    voteId
}) => {
    
    // 버튼 스타일 (로직 동일)
    const getVoteButtonStyle = (isActive, type) => {
        let activeColor = '#6A0DAD';
        let activeBgColor = '#f0e6ff'; 

        if (type === 'dislike' && isActive) {
            activeColor = '#DC3545'; 
            activeBgColor = '#ffe6e6'; 
        } else if (type === 'like' && isActive) {
            activeColor = '#6A0DAD';
            activeBgColor = '#f0e6ff';
        }

        return {
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            fontSize: '1em', 
            color: isActive ? activeColor : '#333', 
            transition: 'all 0.15s',
            padding: '5px 8px',
            borderRadius: '6px',
            backgroundColor: isActive ? activeBgColor : 'transparent',
        };
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div 
                style={getVoteButtonStyle(isLiked, 'like')} 
                onClick={() => onLike(voteId)} 
            >
                <span style={{ fontSize: '1.2em', marginRight: '5px' }}>👍</span>
                <span>{likesCount}</span>
            </div>
            
            <div 
                style={getVoteButtonStyle(isDisliked, 'dislike')} 
                onClick={() => onDislike(voteId)} 
            >
                <span style={{ fontSize: '1.2em', marginRight: '5px' }}>👎</span>
                <span>{dislikesCount}</span>
            </div>
        </div>
    );
};

// 2. 답변 작성 폼 컴포넌트 (Enter 키 로직 포함)
const AnswerForm = ({ 
    currentUser, 
    newAnswer, 
    setNewAnswer, 
    handleAnswerSubmit 
}) => {
    
    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault(); 
        handleAnswerSubmit();
    };

    // ✅ Enter 키 제출 핸들러
    const handleKeyDown = (e) => {
        // Shift + Enter는 줄바꿈 허용
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Enter의 기본 동작(줄바꿈) 방지
            handleAnswerSubmit(); // 제출 함수 호출
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.answerForm}>
            <h4 style={{ margin: '0 0 10px', color: '#6A0DAD', fontSize: '1.2em' }}>답변을 남겨주세요</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <textarea 
                    placeholder={currentUser ? "답변 내용을 입력하세요 (Enter로 등록, Shift+Enter로 줄바꿈)" : "답변을 작성하려면 로그인해야 합니다."} 
                    rows="4" 
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    onKeyDown={handleKeyDown} // ✅ onKeyDown 이벤트 연결
                    style={{ 
                        flex: 1, 
                        padding: '12px', 
                        border: '1px solid #ccc', 
                        borderRadius: '6px',
                        resize: 'vertical', 
                        minHeight: '80px', 
                        backgroundColor: currentUser ? 'white' : '#f0f0f0',
                    }}
                    disabled={!currentUser} 
                />
                <Button 
                    primary 
                    type="submit" 
                    disabled={!newAnswer.trim() || !currentUser} 
                    style={{ height: '40px', flexShrink: 0, marginTop: '5px' }} 
                >
                    등록
                </Button>
            </div>
            {!currentUser && (
                <small style={{ color: '#DC3545', display: 'block', marginTop: '5px' }}>
                    답변을 작성하려면 로그인해야 합니다.
                </small>
            )}
        </form>
    );
};


// 3. 메인 페이지 컴포넌트
function QuestionDetailPage () { 
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState('');
    const [userVotes, setUserVotes] = useState({}); 
    
    const [currentUser, setCurrentUser] = useState(null); 
    const [authLoading, setAuthLoading] = useState(true); 

    const viewCountRef = useRef({}); 
    
    const currentUserId = currentUser?.uid; 
    const isAuthor = question && currentUserId && question.uid === currentUserId;

    // 1. Auth 상태 리스너 (로직 동일)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Timestamp 포맷 함수 (로직 동일)
    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return '날짜 정보 없음';
        try {
            const date = timestamp.toDate();
            return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.error("날짜 포맷 오류:", e);
            return '날짜 오류';
        }
    };


    // 2. 메인 데이터 리스너 (조회수 로직 포함, 로직 동일)
    useEffect(() => {
        if (!id) return;

        const questionRef = doc(db, "questions", id);

        // --- 조회수 증가 로직 (updateDoc + increment 사용) ---
        const incrementViewCount = async () => {
            if (viewCountRef.current[id]) {
                return;
            }
            viewCountRef.current[id] = true;

            try {
                await updateDoc(questionRef, { 
                    viewCount: increment(1) 
                });
            } catch (error) {
                console.error("조회수 증가 실패 (updateDoc):", error);
                viewCountRef.current[id] = false; 
            }
        };

        if (!authLoading) { 
            incrementViewCount();
        }
        // --------------------------------------------------

        // 질문 리스너
        const unsubscribeQuestion = onSnapshot(questionRef, (docSnap) => {
            if (docSnap.exists()) {
                setQuestion({ id: docSnap.id, ...docSnap.data() });
            } else {
                setQuestion(null);
            }
        });

        // 답변 리스너
        const answersCollectionRef = collection(db, "questions", id, "answers");
        const answersQuery = query(answersCollectionRef, orderBy("createdAt", "desc"));
        const unsubscribeAnswers = onSnapshot(answersQuery, (snapshot) => {
            const answersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAnswers(answersList);
        });

        // 사용자 투표 상태 리스너
        let unsubscribeVotes = () => {};
        if (currentUserId) { 
            const votesRef = collection(db, "users", currentUserId, "votes");
            unsubscribeVotes = onSnapshot(votesRef, (snapshot) => {
                const votes = {};
                snapshot.docs.forEach(doc => {
                    votes[doc.id] = doc.data().type; 
                });
                setUserVotes(votes);
            });
        }
        
        // 클린업 함수
        return () => {
            unsubscribeQuestion();
            unsubscribeAnswers();
            unsubscribeVotes();
        };
    }, [id, currentUserId, authLoading]); 


    // 3. 답변 등록 핸들러 (로직 동일)
    const handleAnswerSubmit = async () => {
        if (!newAnswer.trim()) { 
            return;
        } 
        
        if (!currentUser) { 
            alert("답변을 작성하려면 로그인해야 합니다.");
            navigate('/signin'); 
            return;
        } 
        
        const questionRef = doc(db, "questions", id);
        const answersRef = collection(db, "questions", id, "answers");

        try {
            // 1. 새 답변 문서를 먼저 생성 (addDoc 사용)
            await addDoc(answersRef, {
                uid: currentUser.uid,
                userName: currentUser.displayName || '익명',
                content: newAnswer,
                likes: 0,
                dislikes: 0,
                createdAt: serverTimestamp() 
            });

            // 2. 질문 문서 answerCount만 트랜잭션으로 업데이트
            await runTransaction(db, async (transaction) => {
                const questionDoc = await transaction.get(questionRef);
                if (!questionDoc.exists()) {
                    throw new Error("Parent question does not exist. (답변 카운트 업데이트 실패)"); 
                }
                
                const currentAnswerCount = questionDoc.data().answerCount || 0;
                transaction.update(questionRef, { 
                    answerCount: currentAnswerCount + 1 
                });
            });
            
            setNewAnswer(''); 

        } catch (error) {
            console.error("답변 등록 처리 오류:", error);
            alert("답변 등록에 실패했습니다. (네트워크 문제 또는 규칙 오류 확인)");
        }
    };
    
    // 4. 질문 삭제 핸들러 (로직 동일)
    const handleDeleteQuestion = async () => {
        if (!isAuthor) {
            alert("질문 작성자만 삭제할 수 있습니다.");
            return;
        }
        const confirmDelete = window.confirm("정말로 이 질문을 삭제하시겠습니까? 관련 답변도 모두 사라집니다.");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "questions", id)); 
                alert("질문이 성공적으로 삭제되었습니다.");
                navigate('/'); 
            } catch (error) {
                console.error("질문 삭제 오류:", error);
                alert("질문 삭제에 실패했습니다. (보안 규칙 또는 네트워크 문제)");
            }
        }
    };
    
    // 5. 답변 투표 핸들러 (로직 동일)
    const handleVoteTransaction = async (voteId, newAction) => {
        if (!currentUserId) { 
            alert("로그인 후 이용해 주세요.");
            navigate('/signin');
            return;
        }
        
        const voteRef = doc(db, "questions", id, "answers", voteId); 
        const userVoteRef = doc(db, "users", currentUserId, "votes", voteId);
        
        const currentVote = userVotes[voteId];

        try {
            await runTransaction(db, async (transaction) => {
                const voteDoc = await transaction.get(voteRef);
                if (!voteDoc.exists()) throw "투표 대상(답변)이 존재하지 않습니다.";

                let newLikes = voteDoc.data().likes || 0;
                let newDislikes = voteDoc.data().dislikes || 0;

                if (currentVote) {
                    if (currentVote === 'like') {
                        newLikes = Math.max(0, newLikes - 1);
                    } else if (currentVote === 'dislike') {
                        newDislikes = Math.max(0, newDislikes - 1);
                    }
                    if (currentVote === newAction) {
                        transaction.delete(userVoteRef);
                        transaction.update(voteRef, { likes: newLikes, dislikes: newDislikes });
                        return;
                    }
                }
                
                if (newAction === 'like') {
                    newLikes += 1;
                } else if (newAction === 'dislike') {
                    newDislikes += 1;
                }
                
                transaction.set(userVoteRef, { type: newAction, targetType: 'answer' });
                transaction.update(voteRef, { likes: newLikes, dislikes: newDislikes });
            });
        } catch (e) {
            console.error("답변 투표 트랜잭션 실패:", e);
            alert("답변 투표 처리에 실패했습니다. 다시 시도해 주세요.");
        }
    };


    // 6. 질문 투표 핸들러 (로직 동일)
    const handleQuestionVoteTransaction = async (newAction) => {
        if (!currentUserId) { 
            alert("로그인 후 이용해 주세요.");
            navigate('/signin');
            return;
        }

        const questionRef = doc(db, "questions", id); 
        const userVoteRef = doc(db, "users", currentUserId, "votes", id); 

        const currentVote = userVotes[id]; 

        try {
            await runTransaction(db, async (transaction) => {
                const questionDoc = await transaction.get(questionRef);
                if (!questionDoc.exists()) throw "질문 문서를 찾을 수 없습니다.";

                let newLikes = questionDoc.data().likes || 0;
                let newDislikes = questionDoc.data().dislikes || 0;

                if (currentVote) {
                    if (currentVote === 'like') {
                        newLikes = Math.max(0, newLikes - 1);
                    } else if (currentVote === 'dislike') {
                        newDislikes = Math.max(0, newDislikes - 1);
                    }
                    if (currentVote === newAction) {
                        transaction.delete(userVoteRef);
                        transaction.update(questionRef, { likes: newLikes, dislikes: newDislikes });
                        return;
                    }
                }
                
                if (newAction === 'like') {
                    newLikes += 1;
                } else if (newAction === 'dislike') {
                    newDislikes += 1;
                }
                
                transaction.set(userVoteRef, { type: newAction, targetType: 'question' });
                transaction.update(questionRef, { likes: newLikes, dislikes: newDislikes });
            });
        } catch (e) {
            console.error("질문 투표 트랜잭션 실패:", e);
            alert("질문 투표 처리에 실패했습니다. 다시 시도해 주세요.");
        }
    };
    
    // 로딩 처리
    if (authLoading || !question) { 
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>로딩 중이거나 질문을 찾을 수 없습니다.</div>;
    }


    // 7. 메인 렌더링
    return (
        <div style={styles.container}>
            {/* 1. 질문 내용 섹션 */}
            <div style={styles.questionSection}>
                <div style={styles.questionHeader}>
                    <h2 style={styles.questionTitle}>{question.title}</h2>
                    <div style={styles.questionMeta}>
                        <small>작성자: {question.userName || '익명'} | {formatTimestamp(question.createdAt)}</small>
                        <small style={{ fontWeight: 'bold' }}>조회수: {question.viewCount || 0}</small>
                    </div>
                </div>
                <p style={styles.questionContent}>
                    {question.content}
                </p>
                
                {/* 삭제 버튼 (작성자에게만 표시) */}
                <div style={styles.actionContainer}>
                    {isAuthor && (
                        <Button 
                            danger 
                            onClick={handleDeleteQuestion} 
                            style={{ padding: '8px 15px', fontSize: '0.9em' }}
                        >
                            삭제
                        </Button>
                    )}
                </div>

                {/* 질문 자체에 대한 좋아요/싫어요 버튼 렌더링 */}
                <div style={styles.questionVoteContainer}>
                    <LikeButtons
                        isLiked={userVotes[id] === 'like'}
                        isDisliked={userVotes[id] === 'dislike'}
                        likesCount={question.likes || 0}
                        dislikesCount={question.dislikes || 0}
                        onLike={() => handleQuestionVoteTransaction('like')}
                        onDislike={() => handleQuestionVoteTransaction('dislike')}
                        voteId={id} 
                    />
                </div>
            </div>

            {/* 2. 답변 작성 폼 (props 전달) */}
            <AnswerForm 
                currentUser={currentUser}
                newAnswer={newAnswer}
                setNewAnswer={setNewAnswer}
                handleAnswerSubmit={handleAnswerSubmit}
            />

            {/* 3. 답변 리스트 섹션 */}
            <div style={styles.answerSection}>
                <h3 style={styles.answerHeader}>답변 ({answers.length || 0}개)</h3>
                {answers.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#777' }}>아직 답변이 없습니다. 첫 답변을 남겨주세요!</p>
                ) : (
                    <ul style={styles.answerList}>
                        {answers.map((answer) => {
                            const isAnswerLiked = userVotes[answer.id] === 'like';
                            const isAnswerDisliked = userVotes[answer.id] === 'dislike';
                            return (
                                <li key={answer.id} style={styles.answerItem}> 
                                    <div style={styles.answerBody}>
                                        <p style={styles.answerContent}>
                                            {answer.content}
                                        </p>
                                        <div style={styles.answerMeta}>
                                            <small>작성자: {answer.userName || '익명'} | {formatTimestamp(answer.createdAt)}</small>
                                        </div>
                                    </div>
                                    <div style={styles.answerVoteContainer}>
                                        <LikeButtons
                                            isLiked={isAnswerLiked}
                                            isDisliked={isAnswerDisliked} // ✅ 오타 수정 완료
                                            likesCount={answer.likes || 0}
                                            dislikesCount={answer.dislikes || 0}
                                            voteId={answer.id}
                                            onLike={(id) => handleVoteTransaction(id, 'like')}
                                            onDislike={(id) => handleVoteTransaction(id, 'dislike')}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

// 🚨 스타일 객체 (전체 코드에 포함)
const styles = {
    container: { 
        maxWidth: '800px', 
        margin: 'auto', 
        padding: '20px 0 80px 0', 
        minHeight: '100vh',
    },
    questionSection: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        marginBottom: '20px',
    },
    questionHeader: {
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px',
        marginBottom: '15px',
    },
    questionTitle: {
        fontSize: '1.8em',
        margin: '0 0 5px',
        color: '#333',
    },
    questionMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#777',
        fontSize: '0.9em',
    },
    questionContent: {
        fontSize: '1.1em',
        lineHeight: '1.6',
        color: '#333',
        whiteSpace: 'pre-wrap', 
        marginBottom: '20px', 
    },
    actionContainer: {
        display: 'flex',
        justifyContent: 'flex-end', 
        marginBottom: '10px',
        marginTop: '10px', 
    },
    questionVoteContainer: {
        borderTop: '1px solid #eee',
        paddingTop: '15px',
    },
    answerForm: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        marginTop: '0px', 
        marginBottom: '20px', 
    },
    answerSection: {
        padding: '0 10px',
    },
    answerHeader: {
        fontSize: '1.5em',
        borderBottom: '2px solid #6A0DAD',
        paddingBottom: '5px',
        marginBottom: '20px',
        color: '#333',
    },
    answerList: {
        listStyle: 'none',
        padding: 0,
    },
    answerItem: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        marginBottom: '15px',
        display: 'flex', 
        gap: '20px', 
        alignItems: 'flex-start', 
    },
    answerBody: {
        flex: 1, 
        paddingRight: '20px', 
    },
    answerContent: {
        fontSize: '1em',
        lineHeight: '1.5',
        marginBottom: '15px',
        whiteSpace: 'pre-wrap', 
    },
    answerVoteContainer: {
        flexShrink: 0, 
        paddingTop: '5px', 
    },
    answerMeta: {
        display: 'flex',
        justifyContent: 'flex-start', 
        alignItems: 'center',
        color: '#777',
        fontSize: '0.9em',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '10px',
    }
};

export default QuestionDetailPage;