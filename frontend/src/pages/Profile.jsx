import React from 'react';
import './Profile.css';
// Bạn có thể import ảnh avatar từ assets hoặc dùng link online
import avatarImg from '../assets/avatar.jpg'; 

const Profile = () => {
  const projectLinks = [
    { title: 'Báo cáo', url: 'YOUR_GOOGLE_DOC_LINK' },
    { title: 'API Docs', url: 'YOUR_POSTMAN_LINK' },
    { title: 'Github', url: 'YOUR_GITHUB_LINK' },
    { title: 'Figma', url: 'https://www.figma.com/design/0JmVMD1DdqZmACI1XQQrk0/IoT?node-id=0-1&t=Ls1kgjwBRpbuQWng-1' },
  ];

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Cột bên trái: Thông tin cá nhân */}
        <div className="profile-card left-card">
          <div className="avatar-wrapper">
            <img src={avatarImg} alt="Avatar" className="profile-avatar" />
          </div>
          <h2 className="user-name">Nguyễn Hoàng Trường</h2>
          <p className="student-id">B22DCPT301</p>
          
          <div className="contact-info">
            <div className="info-item">
              <span className="icon">📧</span>
              <span>hoangtruong021120045@gmail.com</span>
            </div>
            <div className="info-item">
              <span className="icon">📍</span>
              <span>Ha Noi, Viet Nam</span>
            </div>
          </div>
        </div>

        {/* Cột bên phải: Danh sách dự án */}
        <div className="profile-card right-card">
          <h2 className="project-title">My Project</h2>
          <div className="links-list">
            {projectLinks.map((link, index) => (
              <div className="link-row" key={index}>
                <span className="link-label">{link.title}</span>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="link-button"
                >
                  <span className="icon-link">↗</span> Link
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;