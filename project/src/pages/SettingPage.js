// src/pages/SettingPage.js - **최종 버전 (홈 버튼, 닉네임, 비밀번호, 탈퇴 기능 포함)**

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    auth, 
    db 
} from '../firebase'; 
import { 
    updateProfile, 
    sendPasswordResetEmail, 
    deleteUser 
} from 'firebase/auth';
import { 
    doc, 
    updateDoc, 
    query, 
    collection, 
    where, 
    getDocs,
    runTransaction
} from 'firebase/firestore'; 

import Button from '../components/Button'; 

function SettingPage () { 
    const navigate = useNavigate();
    const currentUser = auth.currentUser; // 현재 로그인 사용자 정보
    
    // 상태 관리
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [newNickname, setNewNickname] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            setEmail(currentUser.email || '이메일 정보 없음');
            // Firebase Auth의 displayName을 초기 닉네임으로 설정
            const currentDisplayName = currentUser.displayName || '닉네임 미설정';
            setNickname(currentDisplayName);
            setNewNickname(currentDisplayName);
            setLoading(false);
        } else {
            // 로그인 상태가 아니면 로그인 페이지로 리디렉션
            navigate('/signin');
        }
    }, [currentUser, navigate]);


    // 1. 닉네임 변경 핸들러
    const handleNicknameUpdate = async () => {
        if (!currentUser || !newNickname.trim() || newNickname === nickname) {
            alert("유효한 새로운 닉네임을 입력하거나 변경사항이 없습니다.");
            return;
        }

        if (newNickname.length < 2) {
            alert("닉네임은 최소 2자 이상이어야 합니다.");
            return;
        }

        try {
            // 1. Firebase Auth 프로필 업데이트
            await updateProfile(currentUser, { 
                displayName: newNickname 
            });

            // 2. 해당 사용자의 모든 'questions' 문서의 userName 필드 업데이트
            const q = query(collection(db, "questions"), where("uid", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            
            const updatePromises = [];
            querySnapshot.forEach((document) => {
                const questionRef = doc(db, "questions", document.id);
                updatePromises.push(updateDoc(questionRef, {
                    userName: newNickname
                }));
            });
            
            await Promise.all(updatePromises);
            
            setNickname(newNickname); // 상태 업데이트
            alert(`닉네임이 '${newNickname}'(으)로 성공적으로 변경되었습니다.`);

        } catch (error) {
            console.error("닉네임 변경 오류:", error);
            alert("닉네임 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };


    // 2. 비밀번호 재설정 핸들러 (이메일 전송)
    const handlePasswordReset = async () => {
        if (!currentUser || !currentUser.email) {
            alert("사용자 정보를 찾을 수 없습니다. 다시 로그인 해주세요.");
            navigate('/signin');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, currentUser.email);
            alert("비밀번호 재설정 이메일이 등록된 이메일 주소로 전송되었습니다. 이메일을 확인하세요.");
        } catch (error) {
            console.error("비밀번호 재설정 이메일 전송 오류:", error);
            alert("비밀번호 재설정 이메일 전송에 실패했습니다. 이메일 주소를 확인하거나 잠시 후 다시 시도해 주세요.");
        }
    };


    // 3. 회원 탈퇴 핸들러
    const handleAccountDelete = async () => {
        if (!currentUser) {
            alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
            navigate('/signin');
            return;
        }

        const confirmDelete = window.confirm(
            "정말로 계정을 탈퇴하시겠습니까?\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다."
        );
        
        if (!confirmDelete) {
            return;
        }

        try {
            // 1. Firestore의 사용자 관련 데이터 삭제 (질문만 삭제)
            
            // 사용자가 작성한 모든 질문 삭제
            const questionQuery = query(collection(db, "questions"), where("uid", "==", currentUser.uid));
            const questionSnapshot = await getDocs(questionQuery);
            
            const deletePromises = [];
            
            questionSnapshot.forEach((questionDoc) => {
                const questionRef = doc(db, "questions", questionDoc.id);
                // 트랜잭션을 사용하여 질문 문서 삭제
                deletePromises.push(runTransaction(db, async (transaction) => {
                    transaction.delete(questionRef);
                }));
            });

            await Promise.all(deletePromises);
            console.log("사용자 작성 질문 데이터 삭제 완료");

            // 2. Firebase Authentication에서 사용자 계정 삭제
            await deleteUser(currentUser);
            
            alert("회원 탈퇴가 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다.");
            navigate('/'); // 랜딩 페이지로 이동
            
        } catch (error) {
            console.error("회원 탈퇴 오류:", error);
            // 'auth/requires-recent-login' 오류는 최근 로그인 필요
            if (error.code === 'auth/requires-recent-login') {
                alert("보안을 위해 계정을 삭제하기 전에 최근에 다시 로그인해야 합니다. 다시 로그인 페이지로 이동합니다.");
                auth.signOut();
                navigate('/signin'); 
            } else {
                alert(`회원 탈퇴 중 오류가 발생했습니다: ${error.message}`);
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '100px' }}>로딩 중...</div>;
    }


    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)' }}>
            
            {/* 🏠 홈으로 돌아가기 버튼 */}
            <div style={{ marginBottom: '20px' }}>
                <Button 
                    type="button" 
                    onClick={() => navigate('/home')} // 홈 페이지로 이동
                    style={{ padding: '8px 15px', border: '1px solid #ccc', backgroundColor: '#f8f9fa', color: '#333' }}
                >
                    🏠 홈으로
                </Button>
            </div>
            
            <h2 style={{textAlign: 'center', color: '#6A0DAD', borderBottom: '2px solid #6A0DAD', paddingBottom: '10px', marginBottom: '30px'}}>
                ⚙️ 계정 설정
            </h2>
            
            {/* 이메일 정보 */}
            <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px', color: '#333' }}>이메일 (ID):</p>
                <p style={{ color: '#555', wordBreak: 'break-all' }}>{email}</p>
            </div>

            {/* 1. 닉네임 변경 섹션 (display: flex로 수정되어 버튼 정렬 문제 해결) */}
            <div style={{ margin: '30px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px', color: '#333' }}>닉네임 변경</p>
                
                {/* 닉네임 입력 필드와 버튼을 감싸는 Flex 컨테이너 */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        value={newNickname} 
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="새로운 닉네임을 입력하세요"
                        // 입력 필드가 남은 공간을 모두 차지하도록 flex: 1 설정
                        style={{ 
                            flex: '1', 
                            padding: '8px', 
                            border: '1px solid #ccc', 
                            borderRadius: '4px',
                        }} 
                    />
                    <Button 
                        // flex 컨테이너 내에서 고정 너비 90px 사용
                        style={{ width: '90px', flexShrink: 0 }} 
                        primary 
                        onClick={handleNicknameUpdate}
                        disabled={!newNickname.trim() || newNickname === nickname || newNickname.length < 2}
                    >
                        변경
                    </Button>
                </div>
                
                <small style={{ color: '#777', display: 'block', marginTop: '10px' }}>현재 닉네임: **{nickname}**</small>
            </div>

            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '40px', color: '#333' }}>
                계정 관리
            </h3>
            
            {/* 2. 비밀번호 재설정 버튼 */}
            <Button 
                style={{ width: '100%', marginTop: '20px', backgroundColor: '#FFC107', color: 'black' }} 
                onClick={handlePasswordReset}
            >
                🔑 비밀번호 재설정 이메일 받기
            </Button>
            
            {/* 로그아웃 버튼 */}
            <Button 
                style={{ width: '100%', marginTop: '15px', backgroundColor: '#6c757d', borderColor: '#6c757d' }} 
                onClick={() => {
                    auth.signOut();
                    navigate('/');
                }}
            >
                🚪 로그아웃
            </Button>

            {/* 3. 회원 탈퇴 버튼 */}
            <Button 
                style={{ width: '100%', marginTop: '15px', backgroundColor: '#DC3545', borderColor: '#DC3545' }} 
                onClick={handleAccountDelete}
            >
                🗑️ 회원 탈퇴 (계정 영구 삭제)
            </Button>
            
        </div>
    );
}

export default SettingPage;