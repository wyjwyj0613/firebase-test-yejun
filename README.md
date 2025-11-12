1. 사용자 인증 및 계정 관리
LandingPage.js: 앱의 시작점으로, 로그인 및 회원가입 페이지로의 진입 경로를 제공합니다.

SignInPage.js: 이메일과 비밀번호를 사용하여 Firebase Auth로 로그인 인증을 처리합니다.

SignUpPage.js: 이메일, 비밀번호, 닉네임을 설정하여 계정을 생성합니다. 비밀번호 재확인 로직이 포함되어 있습니다.

PasswordResetPage.js: 등록된 이메일을 통해 Firebase sendPasswordResetEmail 함수로 비밀번호 재설정 링크를 요청합니다.

SettingPage.js: 사용자 이메일 정보 표시 및 닉네임 변경 기능을 제공합니다.

2. 질문 및 게시물 관리
MainPage.js: 홈 화면으로, questions 컬렉션의 질문 목록을 Firebase 쿼리(orderBy)를 사용하여 게시물 순점수(questionLikes) 순으로 정렬하여 표시합니다.

QuestionWritePage.js: 새로운 질문을 작성하고 Firestore에 저장합니다. 초기 투표 카운트(questionLikes: 0)를 설정합니다.

MyQuestionStatusPage.js: 현재 로그인한 사용자가 작성한 질문만 필터링(where('userId', '==', ...) 쿼리 사용)하여 해당 질문의 답변 및 투표 상태를 보여줍니다.

3. 상호작용 및 투표 시스템
QuestionDetailPage.js: 이 파일은 질문 상세 조회, 답변 작성, 그리고 투표 처리의 중심 로직을 담고 있습니다.
게시물 투표: 좋아요는 +1, 싫어요는 0-1로 반영되는 상호배타적 순점수 시스템입니다. 투표 상태 변경 시 (예: 싫어요 취소 후 좋아요), Firebase 트랜잭션을 사용하여 questionLikes 필드를 안전하게 \pm 2 단위로 업데이트합니다.
답변 투표: 답변별로 likes와 dislikes 카운트를 개별적으로 관리하며, 이 역시 트랜잭션을 통해 중복 투표를 방지하고 두 카운트 필드를 정확히 증감시킵니다.