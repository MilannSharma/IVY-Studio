
export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr' | 'barcode';
  content?: string; // for text, qr, barcode
  src?: string;     // for image
  shape?: 'rect' | 'circle' | 'star' | 'polygon' | 'arrow' | 'line';
  points?: number[];
  sides?: number;
  closed?: boolean;
  pointerAtBeginning?: boolean;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    letterSpacing?: number;
    textAlign?: 'left' | 'center' | 'right';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    opacity?: number;
  };
  draggable: boolean;
  editable: boolean;
  rotation?: number;
}

export interface Template {
  id: string;
  name: string;
  category: 'student' | 'staff' | 'office' | 'other';
  sideType: 'one-side' | 'two-side';
  size: { width: number; height: number };
  pages: number;
  elements: TemplateElement[];
  backElements?: TemplateElement[];
  preview?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const ID_CARD_TEMPLATES: Template[] = [
  {
    id: "horizontal_two_side_pro",
    name: "Professional Horizontal Two-Side",
    category: "student",
    sideType: "two-side",
    orientation: "horizontal",
    size: { width: 540, height: 340 },
    pages: 2,
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 540, height: 340 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      
      // Front Header (Blue with diagonal cut)
      { id: "header_shape", type: "shape", shape: "line", position: { x: 180, y: 0 }, points: [40, 0, 360, 0, 360, 80, 0, 80], closed: true, style: { fill: "#0e30f1" }, draggable: false, editable: false },
      { id: "school_name", type: "text", content: "ABC SCHOOL NAME", position: { x: 220, y: 15 }, size: { width: 300, height: 30 }, style: { fontSize: 22, fill: "#ffffff", fontWeight: "bold", textAlign: "right" }, draggable: true, editable: true },
      { id: "slogan", type: "text", content: "SLOGAN HERE", position: { x: 220, y: 45 }, size: { width: 300, height: 20 }, style: { fontSize: 14, fill: "#ffffff", fontWeight: "bold", textAlign: "right", opacity: 0.8 }, draggable: true, editable: true },
      
      // Logo Area
      { id: "logo_placeholder", type: "text", content: "LOGO HERE", position: { x: 30, y: 20 }, size: { width: 150, height: 25 }, style: { fontSize: 20, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "tagline", type: "text", content: "TAGLINE HERE", position: { x: 30, y: 45 }, size: { width: 150, height: 15 }, style: { fontSize: 10, fill: "#64748b", fontWeight: "bold" }, draggable: true, editable: true },
      
      // Photo
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", position: { x: 60, y: 90 }, size: { width: 110, height: 130 }, style: { borderRadius: 10, stroke: "#0e30f1", strokeWidth: 3 }, draggable: true, editable: true },
      
      // Data Fields
      { id: "label_reg", type: "text", content: "Reg No", position: { x: 230, y: 100 }, size: { width: 100, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_reg", type: "text", content: ": 123456", position: { x: 340, y: 100 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#1e293b" }, draggable: true, editable: true },
      { id: "label_id", type: "text", content: "Student ID", position: { x: 230, y: 125 }, size: { width: 100, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_id", type: "text", content: ": 1234", position: { x: 340, y: 125 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#1e293b" }, draggable: true, editable: true },
      { id: "label_name", type: "text", content: "Student Name", position: { x: 230, y: 150 }, size: { width: 100, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_name", type: "text", content: ": Name Here", position: { x: 340, y: 150 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#1e293b" }, draggable: true, editable: true },
      { id: "label_father", type: "text", content: "Father/ Guardian", position: { x: 230, y: 175 }, size: { width: 100, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_father", type: "text", content: ": Name Here", position: { x: 340, y: 175 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#1e293b" }, draggable: true, editable: true },
      { id: "label_class", type: "text", content: "Class", position: { x: 230, y: 200 }, size: { width: 100, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_class", type: "text", content: ": Class Here", position: { x: 340, y: 200 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#1e293b" }, draggable: true, editable: true },
      { id: "label_emergency", type: "text", content: "Emergency Call", position: { x: 230, y: 225 }, size: { width: 100, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_emergency", type: "text", content: ": 123-456-7890", position: { x: 340, y: 225 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#1e293b" }, draggable: true, editable: true },
      
      // Front Footer (Blue with diagonal cut)
      { id: "footer_shape", type: "shape", shape: "line", position: { x: 0, y: 260 }, points: [0, 0, 260, 0, 300, 80, 0, 80], closed: true, style: { fill: "#0e30f1" }, draggable: false, editable: false },
      { id: "address", type: "text", content: "School address, Street, State, 1234", position: { x: 20, y: 280 }, size: { width: 260, height: 20 }, style: { fontSize: 12, fill: "#ffffff", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "phone", type: "text", content: "Telephone : 123-456-7890", position: { x: 20, y: 305 }, size: { width: 260, height: 20 }, style: { fontSize: 12, fill: "#ffffff", fontWeight: "bold" }, draggable: true, editable: true },
      
      // Signature
      { id: "signature_img", type: "image", src: "https://cdn-icons-png.flaticon.com/512/2912/2912778.png", position: { x: 350, y: 260 }, size: { width: 80, height: 40 }, style: { opacity: 0.6 }, draggable: true, editable: true },
      { id: "signature_text", type: "text", content: "Principal", position: { x: 340, y: 300 }, size: { width: 100, height: 20 }, style: { fontSize: 14, fill: "#1e293b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true }
    ],
    backElements: [
      { id: "bg_back", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 540, height: 340 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      
      // Back Header (Blue with diagonal cut)
      { id: "header_back", type: "shape", shape: "line", position: { x: 0, y: 0 }, points: [0, 0, 340, 0, 300, 80, 0, 80], closed: true, style: { fill: "#0e30f1" }, draggable: false, editable: false },
      { id: "terms_title", type: "text", content: "TERMS AND CONDITIONS", position: { x: 20, y: 25 }, size: { width: 300, height: 30 }, style: { fontSize: 18, fill: "#ffffff", fontWeight: "bold" }, draggable: true, editable: true },
      
      // Dates
      { id: "joined_label", type: "text", content: "Joined Date : DD/MM/YEAR", position: { x: 380, y: 20 }, size: { width: 150, height: 15 }, style: { fontSize: 10, fill: "#1e293b", fontWeight: "bold", textAlign: "right" }, draggable: true, editable: true },
      { id: "expire_label", type: "text", content: "Expire Date : DD/MM/YEAR", position: { x: 380, y: 40 }, size: { width: 150, height: 15 }, style: { fontSize: 10, fill: "#1e293b", fontWeight: "bold", textAlign: "right" }, draggable: true, editable: true },
      
      // Terms
      { id: "terms_list", type: "text", content: "• Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam in nonum to\n  the Lorem ipsum dolor sit amet, consectetuers adipiscing elit, diam nonummys\n  nibh the into a Lorem ipsum dolor sit amet.\n\n• Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam to nonummy\n  nibh euismod tincidunt ut laoreet dolore aliquam erat volutpat.", position: { x: 30, y: 100 }, size: { width: 480, height: 120 }, style: { fontSize: 11, fill: "#64748b", textAlign: "left" }, draggable: true, editable: true },
      
      // Contact Info
      { id: "label_phone", type: "text", content: "Phone", position: { x: 30, y: 240 }, size: { width: 80, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_phone", type: "text", content: ": 123-456-7890", position: { x: 110, y: 240 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#64748b" }, draggable: true, editable: true },
      { id: "label_mail", type: "text", content: "Mail", position: { x: 30, y: 265 }, size: { width: 80, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_mail", type: "text", content: ": urmail@email.com", position: { x: 110, y: 265 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#64748b" }, draggable: true, editable: true },
      { id: "label_web", type: "text", content: "Website", position: { x: 30, y: 290 }, size: { width: 80, height: 20 }, style: { fontSize: 12, fill: "#1e293b", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "val_web", type: "text", content: ": www.urweb.com", position: { x: 110, y: 290 }, size: { width: 150, height: 20 }, style: { fontSize: 12, fill: "#64748b" }, draggable: true, editable: true },
      
      // Back Footer (Blue with diagonal cut)
      { id: "footer_back", type: "shape", shape: "line", position: { x: 240, y: 260 }, points: [40, 0, 300, 0, 300, 80, 0, 80], closed: true, style: { fill: "#0e30f1" }, draggable: false, editable: false },
      { id: "logo_back", type: "text", content: "LOGO HERE", position: { x: 320, y: 280 }, size: { width: 120, height: 20 }, style: { fontSize: 16, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "tagline_back", type: "text", content: "TAGLINE HERE", position: { x: 320, y: 305 }, size: { width: 120, height: 15 }, style: { fontSize: 10, fill: "#ffffff", fontWeight: "bold", textAlign: "center", opacity: 0.8 }, draggable: true, editable: true },
      { id: "qr_back", type: "qr", content: "ABC-SCHOOL-123", position: { x: 460, y: 275 }, size: { width: 50, height: 50 }, draggable: true, editable: true }
    ]
  },
  {
    id: "double_side_modern_student",
    name: "Modern Double Side Student",
    category: "student",
    sideType: "two-side",
    size: { width: 340, height: 540 },
    pages: 2,
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "header", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 120 }, style: { fill: "#4f46e5" }, draggable: false, editable: false },
      { id: "school_name", type: "text", content: "IVY INTERNATIONAL", position: { x: 0, y: 40 }, size: { width: 340, height: 30 }, style: { fontSize: 20, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop", position: { x: 95, y: 140 }, size: { width: 150, height: 150 }, style: { borderRadius: 75, stroke: "#4f46e5", strokeWidth: 4 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "ADITYA SHARMA", position: { x: 0, y: 310 }, size: { width: 340, height: 30 }, style: { fontSize: 22, fill: "#1e293b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "STUDENT", position: { x: 0, y: 345 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#4f46e5", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true }
    ],
    backElements: [
      { id: "bg_back", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#f8fafc" }, draggable: false, editable: false },
      { id: "terms_title", type: "text", content: "TERMS & CONDITIONS", position: { x: 20, y: 40 }, size: { width: 300, height: 30 }, style: { fontSize: 16, fill: "#1e293b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "terms_text", type: "text", content: "1. This card is non-transferable.\n2. Loss of card must be reported immediately.\n3. Found cards should be returned to school office.", position: { x: 30, y: 80 }, size: { width: 280, height: 150 }, style: { fontSize: 12, fill: "#64748b", textAlign: "left" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "ADITYA-SHARMA-2026", position: { x: 120, y: 380 }, size: { width: 100, height: 100 }, draggable: true, editable: true }
    ]
  },
  {
    id: "ginyard_international",
    name: "Ginyard International",
    category: "office",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "office_ginyard",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#f8fafc" }, draggable: false, editable: false },
      { id: "header_bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 140 }, style: { fill: "#0047ab" }, draggable: false, editable: false },
      { id: "header_accent", type: "shape", shape: "rect", position: { x: 220, y: -50 }, size: { width: 200, height: 200 }, style: { fill: "#00bfff", opacity: 0.3 }, rotation: 45, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=G&background=fff&color=0047ab&rounded=true", position: { x: 20, y: 30 }, size: { width: 60, height: 60 }, draggable: true, editable: true },
      { id: "company_name", type: "text", content: "Ginyard\nInternational Co.", position: { x: 90, y: 35 }, size: { width: 230, height: 60 }, style: { fontSize: 18, fill: "#ffffff", fontWeight: "bold", textAlign: "left" }, draggable: true, editable: true },
      { id: "photo_frame", type: "shape", shape: "rect", position: { x: 70, y: 140 }, size: { width: 200, height: 200 }, style: { fill: "transparent", stroke: "#a855f7", strokeWidth: 4 }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop", position: { x: 80, y: 150 }, size: { width: 180, height: 180 }, style: { borderRadius: 90 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "MORGAN MAXWELL", position: { x: 0, y: 360 }, size: { width: 340, height: 40 }, style: { fontSize: 24, fill: "#000000", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "designation", type: "text", content: "MANAGER", position: { x: 0, y: 400 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#000000", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_label", type: "text", content: "ID No", position: { x: 60, y: 440 }, size: { width: 80, height: 20 }, style: { fontSize: 14, fill: "#334155", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "id_value", type: "text", content: ": 1234567890", position: { x: 140, y: 440 }, size: { width: 150, height: 20 }, style: { fontSize: 14, fill: "#334155" }, draggable: true, editable: true },
      { id: "email_label", type: "text", content: "E-mail", position: { x: 60, y: 470 }, size: { width: 80, height: 20 }, style: { fontSize: 14, fill: "#334155", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "email_value", type: "text", content: ": hello@reallygreatsite.com", position: { x: 140, y: 470 }, size: { width: 150, height: 20 }, style: { fontSize: 14, fill: "#334155" }, draggable: true, editable: true },
      { id: "phone_label", type: "text", content: "Phone", position: { x: 60, y: 500 }, size: { width: 80, height: 20 }, style: { fontSize: 14, fill: "#334155", fontWeight: "bold" }, draggable: true, editable: true },
      { id: "phone_value", type: "text", content: ": +123-456-7890", position: { x: 140, y: 500 }, size: { width: 150, height: 20 }, style: { fontSize: 14, fill: "#334155" }, draggable: true, editable: true },
      { id: "bottom_accent_1", type: "shape", shape: "rect", position: { x: -50, y: 490 }, size: { width: 500, height: 100 }, style: { fill: "#0047ab" }, rotation: -10, draggable: false, editable: false },
      { id: "bottom_accent_2", type: "shape", shape: "rect", position: { x: -50, y: 510 }, size: { width: 500, height: 100 }, style: { fill: "#00bfff", opacity: 0.5 }, rotation: -5, draggable: false, editable: false }
    ]
  },
  {
    id: "student_modern_teal",
    name: "Modern Teal Student",
    category: "student",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "student_teal",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "top_curve", type: "shape", shape: "circle", position: { x: 170, y: -100 }, size: { width: 600, height: 400 }, style: { fill: "#0d9488" }, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=S&background=fff&color=0d9488&rounded=true", position: { x: 140, y: 20 }, size: { width: 60, height: 60 }, draggable: true, editable: true },
      { id: "school_name", type: "text", content: "SCHOOL INC.", position: { x: 0, y: 90 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop", position: { x: 95, y: 130 }, size: { width: 150, height: 150 }, style: { borderRadius: 75, stroke: "#ffffff", strokeWidth: 5 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "JESSICA JONES", position: { x: 0, y: 300 }, size: { width: 340, height: 30 }, style: { fontSize: 22, fill: "#0f172a", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "STUDENT", position: { x: 0, y: 330 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#0d9488", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "course_label", type: "text", content: "COURSE", position: { x: 0, y: 370 }, size: { width: 340, height: 15 }, style: { fontSize: 10, fill: "#64748b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "course_val", type: "text", content: "BS IN CIVIL ENGINEERING", position: { x: 0, y: 385 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#0f172a", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_label", type: "text", content: "STUDENT NO :", position: { x: 0, y: 420 }, size: { width: 340, height: 15 }, style: { fontSize: 10, fill: "#64748b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_val", type: "text", content: "2025-0133ACE", position: { x: 0, y: 435 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#0f172a", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "barcode", type: "barcode", content: "20250133", position: { x: 70, y: 470 }, size: { width: 200, height: 40 }, draggable: true, editable: true }
    ]
  },
  {
    id: "staff_minimal_noah",
    name: "Minimalist Staff",
    category: "staff",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "staff_noah",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", position: { x: 0, y: 0 }, size: { width: 340, height: 340 }, draggable: true, editable: true },
      { id: "accent", type: "shape", shape: "rect", position: { x: 0, y: 320 }, size: { width: 340, height: 40 }, style: { fill: "#3b82f6" }, draggable: false, editable: false },
      { id: "name", type: "text", content: "Noah T. Bennett", position: { x: 0, y: 380 }, size: { width: 340, height: 40 }, style: { fontSize: 28, fill: "#1e293b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "Performer (Musician)", position: { x: 0, y: 430 }, size: { width: 340, height: 20 }, style: { fontSize: 16, fill: "#64748b", textAlign: "center" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "NOAH-BENNETT-123", position: { x: 130, y: 460 }, size: { width: 80, height: 80 }, draggable: true, editable: true }
    ]
  },
  {
    id: "office_sophia_orange",
    name: "Corporate Orange",
    category: "office",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "office_sophia",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "top_accent", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 10 }, style: { fill: "#f97316" }, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=CO&background=f97316&color=fff&rounded=true", position: { x: 280, y: 30 }, size: { width: 40, height: 40 }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", position: { x: 70, y: 80 }, size: { width: 200, height: 200 }, style: { borderRadius: 100, stroke: "#f97316", strokeWidth: 4 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "Sophia K. Lee", position: { x: 0, y: 310 }, size: { width: 340, height: 40 }, style: { fontSize: 26, fill: "#1e293b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "Visitor", position: { x: 0, y: 360 }, size: { width: 340, height: 20 }, style: { fontSize: 18, fill: "#64748b", textAlign: "center" }, draggable: true, editable: true },
      { id: "bottom_box", type: "shape", shape: "rect", position: { x: 0, y: 440 }, size: { width: 340, height: 100 }, style: { fill: "#f97316" }, draggable: false, editable: false }
    ]
  },
  {
    id: "student_primary_ethan",
    name: "Primary School Ethan",
    category: "student",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "student_ethan",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "header", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 100 }, style: { fill: "#3b82f6" }, draggable: false, editable: false },
      { id: "school_name", type: "text", content: "PRIMARY SCHOOL", position: { x: 0, y: 30 }, size: { width: 340, height: 20 }, style: { fontSize: 16, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", position: { x: 95, y: 120 }, size: { width: 150, height: 150 }, style: { borderRadius: 10, stroke: "#3b82f6", strokeWidth: 3 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "ETHAN MILLER", position: { x: 0, y: 290 }, size: { width: 340, height: 30 }, style: { fontSize: 22, fill: "#1e293b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_label", type: "text", content: "ID NUMBER:", position: { x: 0, y: 330 }, size: { width: 340, height: 15 }, style: { fontSize: 10, fill: "#64748b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_val", type: "text", content: "P2058-022", position: { x: 0, y: 345 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#3b82f6", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "class_label", type: "text", content: "CLASS: CIB (3RD GRADE)", position: { x: 0, y: 380 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#1e293b", textAlign: "center" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "ETHAN-MILLER-P2058", position: { x: 135, y: 420 }, size: { width: 70, height: 70 }, draggable: true, editable: true }
    ]
  },
  {
    id: "staff_science_jace",
    name: "Science High Staff",
    category: "staff",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "staff_jace",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#1e293b" }, draggable: false, editable: false },
      { id: "accent", type: "shape", shape: "circle", position: { x: 170, y: 0 }, size: { width: 400, height: 400 }, style: { fill: "#3b82f6", opacity: 0.2 }, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=SH&background=3b82f6&color=fff&rounded=true", position: { x: 145, y: 30 }, size: { width: 50, height: 50 }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", position: { x: 100, y: 120 }, size: { width: 140, height: 140 }, style: { borderRadius: 70, stroke: "#3b82f6", strokeWidth: 4 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "JACE MOORE", position: { x: 0, y: 280 }, size: { width: 340, height: 30 }, style: { fontSize: 24, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "dept", type: "text", content: "Dept: Laboratory Research", position: { x: 0, y: 320 }, size: { width: 340, height: 20 }, style: { fontSize: 16, fill: "#93c5fd", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_val", type: "text", content: "ID No: JM258694", position: { x: 0, y: 350 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#ffffff", textAlign: "center" }, draggable: true, editable: true },
      { id: "barcode", type: "barcode", content: "JM258694", position: { x: 70, y: 420 }, size: { width: 200, height: 40 }, draggable: true, editable: true }
    ]
  },
  {
    id: "office_minimal_madeline",
    name: "Minimalist Office Madeline",
    category: "office",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "office_madeline",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "top_bar", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 60 }, style: { fill: "#be123c" }, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=M&background=be123c&color=fff&rounded=true", position: { x: 150, y: 10 }, size: { width: 40, height: 40 }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", position: { x: 95, y: 100 }, size: { width: 150, height: 150 }, style: { borderRadius: 75, stroke: "#be123c", strokeWidth: 3 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "Madeline Smith", position: { x: 0, y: 270 }, size: { width: 340, height: 30 }, style: { fontSize: 22, fill: "#000000", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "Senior HR Associate", position: { x: 0, y: 310 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#64748b", textAlign: "center" }, draggable: true, editable: true },
      { id: "birth_label", type: "text", content: "Joined: 09/18/2023", position: { x: 0, y: 340 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#64748b", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_val", type: "text", content: "ID No: 58477", position: { x: 0, y: 370 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#000000", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "barcode", type: "barcode", content: "58477", position: { x: 70, y: 420 }, size: { width: 200, height: 40 }, draggable: true, editable: true }
    ]
  },
  {
    id: "other_vip_event",
    name: "VIP Event Pass",
    category: "other",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "other_vip",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#000000" }, draggable: false, editable: false },
      { id: "gold_accent", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 120 }, style: { fill: "#d4af37" }, draggable: false, editable: false },
      { id: "title", type: "text", content: "VIP ACCESS", position: { x: 0, y: 40 }, size: { width: 340, height: 40 }, style: { fontSize: 32, fill: "#000000", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop", position: { x: 70, y: 150 }, size: { width: 200, height: 200 }, style: { stroke: "#d4af37", strokeWidth: 5 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "ALEX RIVERA", position: { x: 0, y: 380 }, size: { width: 340, height: 30 }, style: { fontSize: 24, fill: "#d4af37", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "VIP-ALEX-2026", position: { x: 130, y: 430 }, size: { width: 80, height: 80 }, draggable: true, editable: true }
    ]
  },
  {
    id: "student_kindergarten",
    name: "Kindergarten Fun",
    category: "student",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "student_kinder",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#fffbeb" }, draggable: false, editable: false },
      { id: "sun", type: "shape", shape: "circle", position: { x: 280, y: 40 }, size: { width: 80, height: 80 }, style: { fill: "#fcd34d" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop", position: { x: 95, y: 100 }, size: { width: 150, height: 150 }, style: { borderRadius: 75, stroke: "#fbbf24", strokeWidth: 5 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "WILLIAM LEWIS", position: { x: 0, y: 270 }, size: { width: 340, height: 30 }, style: { fontSize: 22, fill: "#b45309", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "class", type: "text", content: "KINDERGARTEN", position: { x: 0, y: 310 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#d97706", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "barcode", type: "barcode", content: "KID2050", position: { x: 70, y: 400 }, size: { width: 200, height: 40 }, draggable: true, editable: true }
    ]
  },
  {
    id: "staff_executive_gold",
    name: "Executive Gold Staff",
    category: "staff",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "staff_executive",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#0f172a" }, draggable: false, editable: false },
      { id: "side_accent", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 15, height: 540 }, style: { fill: "#d4af37" }, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=E&background=d4af37&color=0f172a&rounded=true", position: { x: 40, y: 30 }, size: { width: 50, height: 50 }, draggable: true, editable: true },
      { id: "company", type: "text", content: "EXECUTIVE CORP", position: { x: 100, y: 45 }, size: { width: 200, height: 20 }, style: { fontSize: 14, fill: "#d4af37", fontWeight: "bold", textAlign: "left" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop", position: { x: 70, y: 100 }, size: { width: 200, height: 200 }, style: { stroke: "#d4af37", strokeWidth: 2 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "ALEXANDER PIERCE", position: { x: 15, y: 330 }, size: { width: 325, height: 40 }, style: { fontSize: 24, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "CHIEF EXECUTIVE OFFICER", position: { x: 15, y: 370 }, size: { width: 325, height: 20 }, style: { fontSize: 12, fill: "#d4af37", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_label", type: "text", content: "STAFF ID: EC-001", position: { x: 15, y: 420 }, size: { width: 325, height: 20 }, style: { fontSize: 14, fill: "#94a3b8", textAlign: "center" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "ALEX-PIERCE-CEO", position: { x: 130, y: 450 }, size: { width: 80, height: 80 }, draggable: true, editable: true }
    ]
  },
  {
    id: "staff_creative_modern",
    name: "Creative Modern Staff",
    category: "staff",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "staff_creative",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "top_accent", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 180 }, style: { fill: "#f43f5e" }, draggable: false, editable: false },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", position: { x: 70, y: 60 }, size: { width: 200, height: 200 }, style: { borderRadius: 100, stroke: "#ffffff", strokeWidth: 8 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "SARAH JENKINS", position: { x: 0, y: 290 }, size: { width: 340, height: 40 }, style: { fontSize: 26, fill: "#1e293b", fontWeight: "black", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "CREATIVE DIRECTOR", position: { x: 0, y: 330 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#f43f5e", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "dept", type: "text", content: "DESIGN DEPARTMENT", position: { x: 0, y: 370 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#64748b", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "barcode", type: "barcode", content: "SJ-CREATIVE-2026", position: { x: 70, y: 430 }, size: { width: 200, height: 50 }, draggable: true, editable: true },
      { id: "bottom_bar", type: "shape", shape: "rect", position: { x: 0, y: 520 }, size: { width: 340, height: 20 }, style: { fill: "#f43f5e" }, draggable: false, editable: false }
    ]
  },
  {
    id: "staff_medical_clean",
    name: "Medical Professional Staff",
    category: "staff",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "staff_medical",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#f0f9ff" }, draggable: false, editable: false },
      { id: "header", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 100 }, style: { fill: "#0369a1" }, draggable: false, editable: false },
      { id: "hospital", type: "text", content: "CITY GENERAL HOSPITAL", position: { x: 0, y: 40 }, size: { width: 340, height: 20 }, style: { fontSize: 16, fill: "#ffffff", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=400&h=400&fit=crop", position: { x: 95, y: 120 }, size: { width: 150, height: 150 }, style: { borderRadius: 10, stroke: "#0369a1", strokeWidth: 4 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "DR. EMILY WATSON", position: { x: 0, y: 290 }, size: { width: 340, height: 30 }, style: { fontSize: 22, fill: "#0c4a6e", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "SENIOR CARDIOLOGIST", position: { x: 0, y: 325 }, size: { width: 340, height: 20 }, style: { fontSize: 14, fill: "#0369a1", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "id_label", type: "text", content: "EMP ID: MED-8842", position: { x: 0, y: 370 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#64748b", textAlign: "center" }, draggable: true, editable: true },
      { id: "blood_group", type: "text", content: "BLOOD GROUP: O+", position: { x: 0, y: 395 }, size: { width: 340, height: 20 }, style: { fontSize: 12, fill: "#ef4444", fontWeight: "bold", textAlign: "center" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "DR-EMILY-WATSON-MED8842", position: { x: 135, y: 440 }, size: { width: 70, height: 70 }, draggable: true, editable: true }
    ]
  },
  {
    id: "staff_tech_startup",
    name: "Tech Startup Staff",
    category: "staff",
    sideType: "one-side",
    size: { width: 340, height: 540 },
    pages: 1,
    preview: "staff_tech",
    elements: [
      { id: "bg", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { width: 340, height: 540 }, style: { fill: "#ffffff" }, draggable: false, editable: false },
      { id: "pattern", type: "shape", shape: "circle", position: { x: 300, y: 0 }, size: { width: 200, height: 200 }, style: { fill: "#6366f1", opacity: 0.1 }, draggable: false, editable: false },
      { id: "logo", type: "image", src: "https://ui-avatars.com/api/?name=T&background=6366f1&color=fff&rounded=true", position: { x: 30, y: 30 }, size: { width: 40, height: 40 }, draggable: true, editable: true },
      { id: "photo", type: "image", src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", position: { x: 0, y: 100 }, size: { width: 340, height: 200 }, draggable: true, editable: true },
      { id: "name", type: "text", content: "MARCUS CHENG", position: { x: 30, y: 320 }, size: { width: 280, height: 40 }, style: { fontSize: 28, fill: "#1e293b", fontWeight: "bold", textAlign: "left" }, draggable: true, editable: true },
      { id: "role", type: "text", content: "FULL STACK DEVELOPER", position: { x: 30, y: 365 }, size: { width: 280, height: 20 }, style: { fontSize: 14, fill: "#6366f1", fontWeight: "bold", textAlign: "left" }, draggable: true, editable: true },
      { id: "email", type: "text", content: "marcus.c@startup.io", position: { x: 30, y: 400 }, size: { width: 280, height: 20 }, style: { fontSize: 12, fill: "#64748b", textAlign: "left" }, draggable: true, editable: true },
      { id: "qr", type: "qr", content: "MARCUS-CHENG-TECH", position: { x: 230, y: 430 }, size: { width: 80, height: 80 }, draggable: true, editable: true },
      { id: "accent_line", type: "shape", shape: "rect", position: { x: 30, y: 310 }, size: { width: 60, height: 4 }, style: { fill: "#6366f1" }, draggable: false, editable: false }
    ]
  }
];
