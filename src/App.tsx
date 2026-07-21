import { useState, useEffect } from 'react'
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc} from 'firebase/firestore';
import './App.css'
import Map from './map.tsx';
import mainVideo from './assets/main-video.mp4';
//아이콘
import { FaSubway, FaBus, FaShuttleVan } from 'react-icons/fa';
//네비게이션
import { FaShareAlt, FaArrowUp } from 'react-icons/fa';
// 사진
/*import mainPhoto from './assets/main.jpg';*/
import photo1 from './assets/photo1.jpg';
import photo2 from './assets/photo2.jpg';
import photo3 from './assets/photo3.jpg';
import photo4 from './assets/photo4.jpg';
import photo5 from './assets/photo5.jpg';
import photo6 from './assets/photo6.jpg';
import photo7 from './assets/photo7.jpg';
import photo8 from './assets/photo8.jpg';
/*import groomPic from './assets/groom.jpg';
import bridePic from './assets/bride.jpg';*/

function App() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isGroomAccountOpen, setIsGroomAccountOpen] = useState<boolean>(false);
  const [isBrideAccountOpen, setIsBrideAccountOpen] = useState<boolean>(false);
  const photoList = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8];

  //갤러리
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  // 갤러리 - 버튼 클릭 시 인덱스 조절 함수
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev !== null ? (prev - 1 + photoList.length) % photoList.length : null));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. 이미지를 먼저 투명하게(사라지게)
    const imgElement = document.querySelector('.modal img');
    imgElement?.classList.add('fade-out');
    // 2. 0.3초 뒤에 사진을 교체하고 다시 나타나게
    setTimeout(() => {
      setCurrentIndex((prev) => (prev !== null ? (prev + 1) % photoList.length : null));
      imgElement?.classList.remove('fade-out');
    }, 300);
  };

  //방명록
  const [entries, setEntries] = useState<any[]>([]);
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    if (dateObj.seconds) return new Date(dateObj.seconds * 1000).toLocaleDateString();
    return new Date(dateObj).toLocaleDateString();
  };
  const fetchEntries = async () => {
    try {
      const q = query(collection(db, "guests"), orderBy("date", "desc"));
      const data = await getDocs(q);
      setEntries(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error(error);
    }
  };
  const handleSubmit = async () => {
    if (!name || !message || !password) {
      alert('이름, 내용, 비밀번호를 모두 입력해주세요!');
      return;
    }
    try {
      await addDoc(collection(db, "guests"), { name, message, password, date: new Date() });
      setName(''); setMessage(''); setPassword('');
      fetchEntries();
    } catch (error) {
      alert("등록에 실패했습니다.");
    }
  };
  const handleDelete = async (id: string, entryPassword: string) => {
    const inputPassword = window.prompt("삭제하시려면 비밀번호를 입력해주세요.");
    if (inputPassword === null) return;
    if (inputPassword === entryPassword) {
      try {
        await deleteDoc(doc(db, "guests", id));
        alert("삭제되었습니다.");
        fetchEntries();
      } catch (error) {
        alert("삭제에 실패했습니다.");
      }
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };
  // 페이징 계산 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = entries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  //지하철 icon
  const LineIcon = ({ line, color }: { line: string, color: string }) => (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: color,
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginRight: '6px'
      }}>
    {line}
  </span>
  );

  // 네비게이션 bar
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const initKakao = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('YOUR_JAVASCRIPT_KEY_HERE'); // 본인의 JS 키
    }
  };
  const handleShare = async () => {
    const shareData = {
      title: '희민 & 혜경 결혼합니다',
      url: window.location.href,
    };

    // 1. Web Share API 시도 (모바일 사파리, 크롬 등)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return; // 성공 시 종료
      } catch (err) {
        console.error('공유 실패, 카카오톡 공유로 전환합니다.');
      }
    }

    // 2. Web Share API 실패 시 카카오톡 SDK 시도
    initKakao();
    if (window.Kakao && window.Kakao.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '희민 & 혜경 결혼합니다',
          description: '소중한 분들을 초대합니다.',
          imageUrl: 'https://mingzzzi326.github.io/wedding-invitation/thumbnail.jpg', // https:// 필수
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '청첩장 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      // 3. 둘 다 안될 경우 클립보드 복사
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  //마지막 - 함께한 시간 section
  const [elapsedTime, setElapsedTime] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    //방명록 불러오기
    fetchEntries();

    // 1. 스크롤 감지 Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el) => observer.observe(el));

    // 2. 카운트다운 타이머
    const weddingDate = new Date('2026-10-24T11:00:00');
    const countdownTimer = setInterval(() => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(countdownTimer);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);

    const startDate = new Date('2023-11-20T00:00:00');

    const elapsedTimer = setInterval(() => {
      const now = new Date();
      let diff = now.getTime() - startDate.getTime();

      // 시간 계산 (윤년 대략적 고려)
      const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
      const msPerDay = 1000 * 60 * 60 * 24;
      const msPerHour = 1000 * 60 * 60;
      const msPerMinute = 1000 * 60;
      const years = Math.floor(diff / msPerYear);
      diff -= years * msPerYear;
      const days = Math.floor(diff / msPerDay);
      diff -= days * msPerDay;
      const hours = Math.floor(diff / msPerHour);
      diff -= hours * msPerHour;
      const minutes = Math.floor(diff / msPerMinute);
      diff -= minutes * msPerMinute;
      const seconds = Math.floor(diff / 1000);
      setElapsedTime({ years, days, hours, minutes, seconds });
    }, 1000);

    return () => {
      clearInterval(countdownTimer); // 카운트다운 타이머 종료
      clearInterval(elapsedTimer);   // 함께한 시간 타이머 종료
      fadeElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const copyText = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      alert('계좌번호가 복사되었습니다.');
    });
  };

  return (
      <div className="wrap">
        {/* 1. 메인 커버 섹션 */}
        <section className="cover">
          {/* 1. 영상 섹션 (상단) */}
          <div className="cover-video-section">
            <video
                className="cover-video"
                autoPlay
                muted
                loop
                playsInline
            >
              <source src={mainVideo} type="video/mp4" />
            </video>
          </div>

          {/* 2. 정보 섹션 (영상 아래) */}
          <div className="cover-info-section fade-in">
            <h1 className="title serif">희민 & 혜경</h1>
            <p className="date">2026. 10. 24. SAT AM 11:00<br/>서울 중구 마른내로 71 호텔PJ</p>
          </div>
        </section>

        {/* 2. 인사말 섹션 */}
        <section className="greeting">
          <h2 className="section-title serif fade-in">INVITATION</h2>
          <p className="greeting-text serif fade-in">
            서로가 마주 보며 다져온 사랑을<br/>
            이제 함께 한 곳을 바라보며<br/>
            걸어갈 수 있는 큰 사랑으로 키우고자 합니다.<br/><br/>
            따뜻한 파스텔빛 가을날,<br/>
            저희 두 사람의 출발을<br/>
            축복해 주시면 감사하겠습니다.
          </p>
          <div className="profile-container fade-in">
            {/* 신랑 */}
            <div className="profile-box">
{/*              <img src="" alt="신랑" className="profile-img" />*/}
              <div className="img-placeholder profile-img">IMAGE</div> {/* 사진 대신 회색 박스 */}
              <p className="profile-title">
                <span className="groom-color">신랑</span> 이희민
              </p>
              <p className="profile-detail">이득선 · 김해례 의 장남</p>
            </div>

            {/* 신부 */}
            <div className="profile-box">
{/*              <img src="" alt="신부" className="profile-img" />*/}
              <div className="img-placeholder profile-img">IMAGE</div> {/* 사진 대신 회색 박스 */}
              <p className="profile-title">
                <span className="bride-color">신부</span> 이혜경
              </p>
              <p className="profile-detail">이흥배 · 오민자 의 장녀</p>
            </div>
          </div>
        </section>

        {/* 3. 달력 & 카운트다운 섹션 */}
        <section className="calendar-section">
          <h2 className="section-title serif fade-in">OCTOBER</h2>
          <div className="calendar fade-in">
            <div className="cal-header">
              <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
            </div>
            <div className="cal-body">
              {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`empty-${i}`}></div>
              ))}
              {Array.from({length: 31}).map((_, i) => (
                  <div key={i} className={i + 1 === 24 ? 'active' : ''}>{i + 1}</div>
              ))}
            </div>
          </div>

          <div className="countdown fade-in">
            <p>희민 ❤ 혜경 결혼식까지</p>
            <div className="time-box">
              <span><b>{timeLeft.days}</b>DAYS</span>
              <span><b>{timeLeft.hours}</b>HOURS</span>
              <span><b>{timeLeft.minutes}</b>MIN</span>
              <span><b>{timeLeft.seconds}</b>SEC</span>
            </div>
          </div>
        </section>

        {/* 4. 갤러리 색션 */}
        <section className="gallery">
          <h2 className="section-title serif fade-in">GALLERY</h2>
          <div className="gallery-grid fade-in">
            {photoList.map((src, index) => (
                <img
                    key={index}
                    src={src}
                    alt="웨딩"
                    loading="lazy"
                    onClick={() => setCurrentIndex(index)} // 인덱스 저장
                />
            ))}
          </div>
        </section>

        {/* 사진 클릭 시 나타나는 확대 모달 */}
        {currentIndex !== null && (
            <div className="modal" onClick={() => setCurrentIndex(null)}>
              {/* 닫기 버튼 추가 */}
              <button className="close-btn" onClick={() => setCurrentIndex(null)}>×</button>
              <button className="nav-btn prev" onClick={handlePrev}>&lt;</button>
              <img src={photoList[currentIndex]} alt="확대사진" onClick={(e) => e.stopPropagation()} />
              <button className="nav-btn next" onClick={handleNext}>&gt;</button>
            </div>
        )}

        {/* 5. 지도 섹션 */}
        <section className="location">
          <div className="fade-in">
            <h2 className="section-title serif">LOCATION</h2>
            <div className="map-container">
              <Map />
            </div>

            {/* 길 안내 버튼 (지도 앱으로 연결) */}
            <div className="button-group">
              <a href="https://naver.me/56X9I9Zl" className="map-btn naver">네이버 지도</a>
              <a href="https://place.map.kakao.com/26887653?fromAppLink=true" className="map-btn kakao">카카오맵</a>
              <a href="https://tmap.life/a1bd696f" className="map-btn tMap">티맵</a>
            </div>
          </div>

          <div className="traffic-info fade-in">
            <h3><FaSubway style={{ marginRight: '8px' }} />지하철</h3>
            <p>
              <LineIcon line="3" color="#ff7f00" />
              <LineIcon line="4" color="#2ca4d8" />
              <strong>충무로역</strong>&nbsp;&nbsp;|&nbsp;&nbsp;8번 출구에서 도보 5분
            </p>
            <p>
              <LineIcon line="2" color="#3cb44a" />
              <LineIcon line="5" color="#9932cc" />
              <strong>을지로4가역</strong>&nbsp;&nbsp;|&nbsp;&nbsp;10번 출구에서 도보 4분
            </p>

            <h3><FaBus style={{ marginRight: '8px' }} />버스</h3>
            <p><strong>을지로4가 방면</strong>&nbsp;&nbsp;|&nbsp;&nbsp;100, 105, 152, 202, 261, 604, 7011</p>
            <p><strong>퇴계로 방면</strong>&nbsp;&nbsp;|&nbsp;&nbsp; 104, 105, 140, 463, 421, 507, 604, 7011</p>

            <h3><FaShuttleVan style={{ marginRight: '8px' }} />셔틀버스</h3>
            <p>예식 1시간 전부터 10~15분 간격 왕복 운행</p>
            <p className="notice">* 운영 시간 및 간격은 예식 상황에 따라 변동될 수 있습니다.</p>
            <p><LineIcon line="3" color="#ff7f00" />
              <LineIcon line="4" color="#2ca4d8" />
              <strong>충무로역</strong> 8번 출구 앞 탑승</p>
            <p><LineIcon line="2" color="#3cb44a" />
              <LineIcon line="5" color="#9932cc" />
              <strong>을지로4가역</strong> 9번 출구 GS25(편의점) 골목에서 탑승</p>
          </div>
        </section>

        {/* 6. 계좌번호 섹션 */}
        <section className="account fade-in">
          <h2 className="section-title serif">ACCOUNT</h2>
          <p className="account-desc">참석이 어려우신 분들을 위해<br/>계좌번호를 기재하였습니다. 너른 양해 부탁드립니다.</p>

          {/* 신랑측 */}
          <button className="btn-toggle" onClick={() => setIsGroomAccountOpen(!isGroomAccountOpen)}>
            신랑측 계좌번호 보기 {isGroomAccountOpen ? '▲' : '▼'}
          </button>
          {isGroomAccountOpen && (
              <div className="account-details">
                <p><strong>국민은행</strong> 123456-78-901234</p>
                <div className="bank-flex">
                  <span>예금주: 이희민</span>
                  <button className="btn-copy" onClick={() => copyText('12345678901234')}>복사</button>
                </div>
              </div>
          )}

          {/* 신부측 */}
          <button className="btn-toggle" onClick={() => setIsBrideAccountOpen(!isBrideAccountOpen)} style={{marginTop: '10px'}}>
            신부측 계좌번호 보기 {isBrideAccountOpen ? '▲' : '▼'}
          </button>
          {isBrideAccountOpen && (
              <div className="account-details">
                <p><strong>국민은행</strong> 110-123-456789</p>
                <div className="bank-flex">
                  <span>예금주: 이혜경</span>
                  <button className="btn-copy" onClick={() => copyText('110123456789')}>복사</button>
                </div>
              </div>
          )}
        </section>

        {/* 6. 방명록 */}
        <section className="guestbook">
          <h2 className="section-title serif fade-in">GUESTBOOK</h2>
          {/* 1) 방명록 작성 폼 (메인 노출) */}
          <div className="guestbook-form fade-in">
            <div className="form-inputs">
              <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={10}
              />
              <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={10}
              />
            </div>
            <textarea
                placeholder="축하 메시지를 남겨주세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
            />
            <button className="btn-submit" onClick={handleSubmit}>등록하기</button>
          </div>

          {/* 2) 메인 리스트 (최신 3개만 노출) */}
          <div className="guestbook-list fade-in">
            {entries.slice(0, 3).map((entry: any) => (
                <div key={entry.id} className="guestbook-item">
                  <div className="item-header">
                    <span className="name"><strong>{entry.name}</strong></span>
                    <div className="item-right">
                      <span className="date">{formatDate(entry.date)}</span>
                      <button className="btn-delete" onClick={() => handleDelete(entry.id, entry.password)}>✕</button>
                    </div>
                  </div>
                  <p className="message">{entry.message}</p>
                </div>
            ))}
          </div>

          {/* 3) 전체보기 버튼 */}
          <button className="btn-view-all fade-in" onClick={() => setIsAllModalOpen(true)}>
            전체보기
          </button>

          {/* 4) 방명록 전체보기 모달 */}
          {isAllModalOpen && (
              <div className="modal-overlay" onClick={() => setIsAllModalOpen(false)}>
                <div className="modal-content all-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>방명록 전체보기</h3>
                    <button className="btn-close" onClick={() => setIsAllModalOpen(false)}>✕</button>
                  </div>

                  <div className="modal-body scrollable">
                    {entries.length === 0 ? (
                        // 작성된 방명록이 없을 때의 빈 화면
                        <div className="empty-state">
                          <p>아직 작성된 방명록이 없습니다.<br/>첫 방명록을 작성해주세요.</p>
                          <button className="btn-empty-write" onClick={() => setIsAllModalOpen(false)}>작성하기</button>
                        </div>
                    ) : (
                        // 작성된 방명록이 있을 때의 리스트와 페이징
                        <>
                          {currentItems.map((entry: any) => (
                              <div key={entry.id} className="guestbook-item">
                                <div className="item-header">
                                  <span className="name"><strong>{entry.name}</strong></span>
                                  <div className="item-right">
                                    <span className="date">{formatDate(entry.date)}</span>
                                    <button className="btn-delete" onClick={() => handleDelete(entry.id, entry.password)}>✕</button>
                                  </div>
                                </div>
                                <p className="message">{entry.message}</p>
                              </div>
                          ))}

                          {/* 페이징 버튼 */}
                          <div className="pagination">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                  {i + 1}
                                </button>
                            ))}
                          </div>
                        </>
                    )}
                  </div>
                </div>
              </div>
          )}
        </section>

        {/* 하단 네비게이션 바 */}
        <div className="floating-buttons">
          <button onClick={scrollToTop} className="float-btn">
            <FaArrowUp />
          </button>
          <button onClick={handleShare} className="float-btn">
            <FaShareAlt />
          </button>
        </div>

        {/* 하단 D-day */}
        <section className="together-section fade-in">
          <p className="together-title">함께한 시간</p>
          <p className="together-time">
            "{elapsedTime.years}년 {elapsedTime.days}일 {elapsedTime.hours}시간 {elapsedTime.minutes}분 {elapsedTime.seconds}초"
          </p>
        </section>
        <section className="closing-image-section fade-in">
          <div className="closing-wrapper">
            {/* 💡 마지막으로 들어갈 예쁜 사진 경로로 변경해 주세요 */}
            <img src={photo8} alt="행복하게 잘 살겠습니다" className="closing-image" />
          </div>
        </section>

        <footer className="copyright">
          COPYRIGHT LEEHYEKYUNG. All rights reserved.
        </footer>
      </div>
  );
}

export default App
