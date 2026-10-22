export default function PlayerFooter() {
  return (
    <footer className="snx-global-footer">
      <div className="snx-footer-container">
        {/* Top Section */}
        <div className="snx-footer-top">
          {/* Brand Info */}
          <div className="snx-footer-brand-wrap">
            <div className="snx-footer-brand">
              <span className="snx-footer-logo-sq">
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#fff' }}>
                  bolt
                </span>
              </span>
              <strong>SPORTNEXUS VIETNAM</strong>
            </div>
            <p className="snx-footer-desc">
              Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn diện.
            </p>
          </div>

          {/* Contact & Legal Links */}
          <div className="snx-footer-links-group">
            <div className="snx-footer-links-row">
              <span className="snx-footer-info-item">
                <span className="material-symbols-outlined">support_agent</span>
                <span>Hotline 24/7: 0968950913</span>
              </span>
              <span className="snx-footer-info-item">
                <span className="material-symbols-outlined">verified_user</span>
                <span>Bảo vệ Ký Quỹ Escrow</span>
              </span>
            </div>
            <div className="snx-footer-links-row snx-footer-nav-links">
              <a href="#rules" onClick={(e) => e.preventDefault()}>Điều khoản dịch vụ</a>
              <a href="#fairplay" onClick={(e) => e.preventDefault()}>Chính sách Fairplay</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="snx-footer-bottom">
          <span className="snx-footer-copyright">
            © 2026 SportNexus Vietnam Joint Stock Company • Nền tảng chuyên biệt Pickleball &amp; Cầu Lông. Bảo lưu mọi quyền.
          </span>
          <span className="snx-live-indicator">
            <span className="snx-live-dot" />
            <span>HỆ THỐNG BẢO CHỨNG ESCROW THỜI GIAN THỰC</span>
          </span>
        </div>
      </div>

      <style>{`
        .snx-global-footer {
          width: 100%;
          margin-top: 48px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid rgba(45, 95, 63, 0.14);
          padding: 24px 32px 20px;
          box-sizing: border-box;
          position: relative;
          z-index: 10;
        }

        .snx-footer-container {
          max-width: 1320px;
          margin: 0 auto;
          width: 100%;
        }

        .snx-footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 28px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .snx-footer-brand-wrap {
          max-width: 540px;
        }

        .snx-footer-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 6px;
        }

        .snx-footer-logo-sq {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #2D5F3F;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(45, 95, 63, 0.22);
        }

        .snx-footer-brand strong {
          font-size: 14.5px;
          font-weight: 850;
          letter-spacing: 0.3px;
          color: #111827;
        }

        .snx-footer-desc {
          font-size: 12.5px;
          color: #4B5563;
          margin: 0;
          line-height: 1.5;
          font-weight: 500;
        }

        .snx-footer-links-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-end;
        }

        .snx-footer-links-row {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .snx-footer-info-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #1F2937;
        }

        .snx-footer-info-item .material-symbols-outlined {
          font-size: 16px;
          color: #15803D;
        }

        .snx-footer-nav-links a {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          transition: color 0.15s;
        }

        .snx-footer-nav-links a:hover {
          color: #15803D;
          text-decoration: underline;
        }

        .snx-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.07);
          font-size: 11.5px;
          color: #6B7280;
        }

        .snx-footer-copyright {
          font-weight: 500;
        }

        .snx-live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 750;
          color: #15803D;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          font-size: 11.5px;
        }

        .snx-live-dot {
          width: 7.5px;
          height: 7.5px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
          animation: snxLivePulse 1.8s infinite;
        }

        @keyframes snxLivePulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @media (max-width: 768px) {
          .snx-global-footer {
            padding: 20px 16px 16px;
          }
          .snx-footer-links-group {
            align-items: flex-start;
          }
          .snx-footer-links-row {
            gap: 16px;
          }
          .snx-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </footer>
  )
}
