import React from 'react';
import './Profile.css';
// Bạn có thể import ảnh avatar từ assets hoặc dùng link online
import avatarImg from '../assets/avatar.jpg'; 

const Profile = () => {
  const projectLinks = [
    { title: 'Báo cáo', url: 'https://docs.google.com/document/d/1s08a_6QudpjU9TyVFH4obvcC-Ylt4-jfCgWApJjdlCA/edit?usp=sharing' },
    { title: 'API Docs', url: "https://hoangtruong021120045-5627572.postman.co/workspace/Truong-Nguyen-Hoang's-Workspace~440292b4-a81f-4bb9-875c-438e431f4ba9/collection/49617246-449d92bc-3287-4dee-8148-d3456036e379?action=share&source=copy-link&creator=49617246" },
    { title: 'Github', url: 'https://github.com/truongYSB/IoT_Project#' },
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