import { useEffect } from 'react';

declare global {
    interface Window {
        kakao: any; // 지도 API용
        Kakao: any; // 공유 SDK용
    }
}

const Map = () => {
    useEffect(() => {
        // 1. 컴포넌트가 다 그려진 후에 실행됨
        const kakao = window.kakao;
        const container = document.getElementById('map');

        if (container && kakao) {
            const options = {
                center: new kakao.maps.LatLng(37.56480782321409, 126.99569887431603),
                level: 4
            };
            const map = new kakao.maps.Map(container, options);

            // 마커 추가
            const markerPosition = new kakao.maps.LatLng(37.56480782321409, 126.99569887431603);
            const marker = new kakao.maps.Marker({ position: markerPosition });
            marker.setMap(map);

            // 모바일 조작 방지
            map.setZoomable(false);
        }
    }, []); // []는 페이지 로딩 시 딱 한 번만 실행하라는 의미

    return (
        <div
            id="map"
            style={{ width: '100%', height: '300px', borderRadius: '15px' }}
            onClick={() => window.open('https://map.kakao.com/link/to/호텔 PJ,37.56480782321409,126.99569887431603')}
        />
    );
};

export default Map;