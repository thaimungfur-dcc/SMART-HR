import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  Users, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, Phone, 
  Mail, MapPin, GraduationCap, HeartPulse, CreditCard, Calendar, UploadCloud,
  FileText, ShieldCheck, Download, Camera, Link, Eye, ClipboardList, Database, Award
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import { dbSync } from '../../services/dbSync';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced with Home & Permissions Deep Navy/Gold Palette) ---
const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
  sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
  glassWhite: 'rgba(255, 255, 255, 0.88)',
  primary: '#212c46',
  primaryLight: '#4d87a8',
  accent: '#a94228',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  indigo: '#414757',
  softPurple: '#ab7d82',
  deepPurple: '#2d2c4a',
  pinkAccent: '#a54f6b',
  mutedSlate: '#606a5f',
  darkSlate: '#2f2926',
  silver: '#d7d7d7',
  deepNavy: '#212c46',
  brownGold: '#b58c4f',
  vibrantPurple: '#2d2c4a',
  burntOrange: '#d96245',
  slateBlue: '#748ea1',
  coolGray: '#eaeaec'
};

const kebabToPascal = (str: string) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
const LucideIcon = ({ name, size = 16, className = "", color, style, strokeWidth = 2.5 }: any) => {
    if (!name) return null;
    if (typeof name !== 'string') {
        const IconComponent = name;
        return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
    }
    const pascalName = kebabToPascal(name);
    const IconComponent = Icons[pascalName as keyof typeof Icons] || Icons.CircleHelp;
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
};

const INITIAL_EMPLOYEES = [
  { 
    id: 1, staffId: 'EMP-24001', employeeId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun',
    name: 'สมชาย มุ่งมั่น (Somchai Mungmun)', nickName: 'ชาย (Chai)',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
    section: 'Software Dev', jobTitle: 'Senior Fullstack Developer', position: 'Senior Fullstack Developer',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2020-01-15', hiringDate: '2020-01-15', hireDate: '2020-01-15',
    yos: '4 Yrs 3 Mos', idCard: '1100500123456', socialSec: 'Active', gender: 'Male', birthDate: '1990-05-20',
    age: 34, ageHiring: 30, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'Exempted', driving: 'Car License',
    email: 'somchai.m@tamarindpro.com', phone: '081-234-5678', addressId: '123/45 Sukhumvit Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Somsri Mungmun (Mother)', emerPhone: '089-876-5432', blood: 'O', education: 'Bachelor Degree', major: 'Computer Engineering',
    bank: 'KBank', bankAcc: '012-3-45678-9', termination: '', reason: ''
  },
  { 
    id: 2, staffId: 'EMP-22045', employeeId: 'EMP-22045', nameTh: 'วิภาดา แสงงาม', nameEn: 'Wipada Saengngam',
    name: 'วิภาดา แสงงาม (Wipada Saengngam)', nickName: 'วิ (Wi)',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Quality Assurance', department: 'Quality Assurance',
    section: 'QC Line', jobTitle: 'QA Manager', position: 'QA Manager',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2018-08-01', hiringDate: '2018-08-01', hireDate: '2018-08-01',
    yos: '5 Yrs 8 Mos', idCard: '3100500987654', socialSec: 'Active', gender: 'Female', birthDate: '1985-11-10',
    age: 38, ageHiring: 33, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 2, military: 'N/A', driving: 'Car License',
    email: 'wipada.s@tamarindpro.com', phone: '085-555-1234', addressId: '45 Phetchabun Rd., Phetchabun', addressPres: 'Same as ID',
    emerContact: 'Manop Saengngam (Husband)', emerPhone: '081-111-2222', blood: 'B', education: 'Master Degree', major: 'Food Science',
    bank: 'SCB', bankAcc: '987-6-54321-0', termination: '', reason: ''
  },
  { 
    id: 3, staffId: 'EMP-24003', employeeId: 'EMP-24003', nameTh: 'กิตติพงษ์ ยอดเยี่ยม', nameEn: 'Kittipong Yodyiem',
    name: 'กิตติพงษ์ ยอดเยี่ยม (Kittipong Yodyiem)', nickName: 'กิต (Kit)',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
    section: 'Infrastructure', jobTitle: 'IT Lead', position: 'IT Lead',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2018-06-01', hiringDate: '2018-06-01', hireDate: '2018-06-01',
    yos: '6 Yrs', idCard: '1100500123403', socialSec: 'Active', gender: 'Male', birthDate: '1988-06-14',
    age: 38, ageHiring: 30, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
    email: 'kittipong.y@chaisri.com', phone: '081-345-6789', addressId: '456/78 Rama 9 Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Nonglak Yodyiem (Wife)', emerPhone: '089-123-4567', blood: 'A', education: 'Bachelor Degree', major: 'Information Technology',
    bank: 'KBank', bankAcc: '012-3-55555-9', termination: '', reason: ''
  },
  { 
    id: 4, staffId: 'EMP-24004', employeeId: 'EMP-24004', nameTh: 'นภาลัย เรืองรอง', nameEn: 'Napalai Ruangrong',
    name: 'นภาลัย เรืองรอง (Napalai Ruangrong)', nickName: 'ฟ้า (Fah)',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Production', department: 'Production',
    section: 'Quality Control', jobTitle: 'Quality Auditor', position: 'Quality Auditor',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2022-06-25', hiringDate: '2022-06-25', hireDate: '2022-06-25',
    yos: '4 Yrs', idCard: '1100500123404', socialSec: 'Active', gender: 'Female', birthDate: '1992-06-18',
    age: 34, ageHiring: 30, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Both',
    email: 'napalai.r@chaisri.com', phone: '082-456-7890', addressId: '789/12 Charoen Krung Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Patsorn Ruangrong (Sister)', emerPhone: '085-234-5678', blood: 'B', education: 'Bachelor Degree', major: 'Food Science',
    bank: 'SCB', bankAcc: '123-4-56789-0', termination: '', reason: ''
  },
  { 
    id: 5, staffId: 'EMP-24005', employeeId: 'EMP-24005', nameTh: 'วิชัย ว่องไว', nameEn: 'Wichai Wongwai',
    name: 'วิชัย ว่องไว (Wichai Wongwai)', nickName: 'ชัย (Chai)',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Logistics', department: 'Logistics',
    section: 'Warehouse', jobTitle: 'Logistics Supervisor', position: 'Logistics Supervisor',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2020-06-15', hiringDate: '2020-06-15', hireDate: '2020-06-15',
    yos: '6 Yrs', idCard: '1100500123405', socialSec: 'Active', gender: 'Male', birthDate: '1991-06-20',
    age: 35, ageHiring: 29, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
    email: 'wichai.w@chaisri.com', phone: '083-567-8901', addressId: '101/23 Phaholyothin Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Pranee Wongwai (Mother)', emerPhone: '086-345-6789', blood: 'O', education: 'Bachelor Degree', major: 'Logistics Management',
    bank: 'BBL', bankAcc: '234-5-67890-1', termination: '', reason: ''
  },
  { 
    id: 6, staffId: 'EMP-24006', employeeId: 'EMP-24006', nameTh: 'สิรินทรา มีสุข', nameEn: 'Sirintra Meesook',
    name: 'สิรินทรา มีสุข (Sirintra Meesook)', nickName: 'สิ (Si)',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Human Resources', department: 'Human Resources',
    section: 'Recruitment', jobTitle: 'HR Recruiter', position: 'HR Recruiter',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2023-06-12', hiringDate: '2023-06-12', hireDate: '2023-06-12',
    yos: '3 Yrs', idCard: '1100500123406', socialSec: 'Active', gender: 'Female', birthDate: '1994-07-02',
    age: 31, ageHiring: 28, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
    email: 'sirintra.m@chaisri.com', phone: '084-678-9012', addressId: '202/34 Ladprao Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Santi Meesook (Father)', emerPhone: '087-456-7890', blood: 'AB', education: 'Bachelor Degree', major: 'Human Resources',
    bank: 'KBank', bankAcc: '012-3-67890-1', termination: '', reason: ''
  },
  { 
    id: 7, staffId: 'EMP-24007', employeeId: 'EMP-24007', nameTh: 'ชลวิทย์ เก่งกาจ', nameEn: 'Chonlawit Kengkarj',
    name: 'ชลวิทย์ เก่งกาจ (Chonlawit Kengkarj)', nickName: 'ชล (Chon)',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Production', department: 'Production',
    section: 'Assembly Line', jobTitle: 'Production Engineer', position: 'Production Engineer',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2017-06-20', hiringDate: '2017-06-20', hireDate: '2017-06-20',
    yos: '9 Yrs', idCard: '1100500123407', socialSec: 'Active', gender: 'Male', birthDate: '1987-06-28',
    age: 38, ageHiring: 29, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 2, military: 'Completed', driving: 'Car License',
    email: 'chonlawit.k@chaisri.com', phone: '085-789-0123', addressId: '303/45 Vibhavadi Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Malee Kengkarj (Mother)', emerPhone: '088-567-8901', blood: 'O', education: 'Bachelor Degree', major: 'Industrial Engineering',
    bank: 'KBank', bankAcc: '012-3-78901-2', termination: '', reason: ''
  },
  { 
    id: 8, staffId: 'EMP-24008', employeeId: 'EMP-24008', nameTh: 'ธนพล มั่งคั่ง', nameEn: 'Thanaphol Mangkang',
    name: 'ธนพล มั่งคั่ง (Thanaphol Mangkang)', nickName: 'พล (Phol)',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Finance & Accounting', department: 'Finance & Accounting',
    section: 'Treasury', jobTitle: 'Finance Director', position: 'Finance Director',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2015-04-10', hiringDate: '2015-04-10', hireDate: '2015-04-10',
    yos: '11 Yrs', idCard: '1100500123408', socialSec: 'Active', gender: 'Male', birthDate: '1980-03-12',
    age: 46, ageHiring: 35, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 3, military: 'Completed', driving: 'Car License',
    email: 'thanaphol.m@chaisri.com', phone: '086-890-1234', addressId: '404/56 Sukhumvit 101, Bangkok', addressPres: 'Same as ID',
    emerContact: 'Nipa Mangkang (Wife)', emerPhone: '089-678-9012', blood: 'A', education: 'Master Degree', major: 'Finance',
    bank: 'SCB', bankAcc: '123-4-78901-2', termination: '', reason: ''
  },
  { 
    id: 9, staffId: 'EMP-24009', employeeId: 'EMP-24009', nameTh: 'พิมพพรรณ สวยงาม', nameEn: 'Pimphan Suayngam',
    name: 'พิมพพรรณ สวยงาม (Pimphan Suayngam)', nickName: 'พิม (Pim)',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
    section: 'Innovation Team', jobTitle: 'Software Engineer', position: 'Software Engineer',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2024-01-10', hiringDate: '2024-01-10', hireDate: '2024-01-10',
    yos: '2 Yrs', idCard: '1100500123409', socialSec: 'Active', gender: 'Female', birthDate: '1998-09-05',
    age: 27, ageHiring: 25, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'None',
    email: 'pimphan.s@chaisri.com', phone: '087-901-2345', addressId: '505/67 Ramkhamhaeng Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Aree Suayngam (Mother)', emerPhone: '081-789-0123', blood: 'B', education: 'Bachelor Degree', major: 'Computer Science',
    bank: 'KBank', bankAcc: '012-3-89012-3', termination: '', reason: ''
  },
  { 
    id: 10, staffId: 'EMP-24010', employeeId: 'EMP-24010', nameTh: 'อัญชลี รักษ์ดี', nameEn: 'Anchalee Rakdee',
    name: 'อัญชลี รักษ์ดี (Anchalee Rakdee)', nickName: 'แอน (Ann)',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Quality Assurance', department: 'Quality Assurance',
    section: 'QA Audit', jobTitle: 'QA Inspector', position: 'QA Inspector',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2021-03-15', hiringDate: '2021-03-15', hireDate: '2021-03-15',
    yos: '5 Yrs', idCard: '1100500123410', socialSec: 'Active', gender: 'Female', birthDate: '1993-12-25',
    age: 32, ageHiring: 27, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
    email: 'anchalee.r@chaisri.com', phone: '088-012-3456', addressId: '606/78 Srinakarin Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Prasert Rakdee (Father)', emerPhone: '082-890-1234', blood: 'O', education: 'Bachelor Degree', major: 'Biotechnology',
    bank: 'SCB', bankAcc: '123-4-89012-3', termination: '', reason: ''
  },
  { 
    id: 11, staffId: 'EMP-24011', employeeId: 'EMP-24011', nameTh: 'พงษ์ศักดิ์ ศรีสุข', nameEn: 'Pongsak Srisook',
    name: 'พงษ์ศักดิ์ ศรีสุข (Pongsak Srisook)', nickName: 'พงษ์ (Pong)',
    image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Production', department: 'Production',
    section: 'Maintenance', jobTitle: 'Maintenance Supervisor', position: 'Maintenance Supervisor',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2019-11-01', hiringDate: '2019-11-01', hireDate: '2019-11-01',
    yos: '6 Yrs 7 Mos', idCard: '1100500123411', socialSec: 'Active', gender: 'Male', birthDate: '1986-07-15',
    age: 39, ageHiring: 32, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Both',
    email: 'pongsak.s@chaisri.com', phone: '089-123-4567', addressId: '707/89 Navamin Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Sunee Srisook (Mother)', emerPhone: '083-901-2345', blood: 'A', education: 'Bachelor Degree', major: 'Mechanical Engineering',
    bank: 'BBL', bankAcc: '234-5-89012-3', termination: '', reason: ''
  },
  { 
    id: 12, staffId: 'EMP-24012', employeeId: 'EMP-24012', nameTh: 'ศิริพร อุดมดี', nameEn: 'Siriporn Udomdee',
    name: 'ศิริพร อุดมดี (Siriporn Udomdee)', nickName: 'พร (Porn)',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Human Resources', department: 'Human Resources',
    section: 'Compensation', jobTitle: 'HR Specialist', position: 'HR Specialist',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2022-09-01', hiringDate: '2022-09-01', hireDate: '2022-09-01',
    yos: '3 Yrs 9 Mos', idCard: '1100500123412', socialSec: 'Active', gender: 'Female', birthDate: '1991-02-18',
    age: 35, ageHiring: 31, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
    email: 'siriporn.u@chaisri.com', phone: '081-456-7890', addressId: '808/90 Ratchadapisek Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Vichit Udomdee (Father)', emerPhone: '084-012-3456', blood: 'O', education: 'Bachelor Degree', major: 'Psychology',
    bank: 'KBank', bankAcc: '012-3-90123-4', termination: '', reason: ''
  },
  { 
    id: 13, staffId: 'EMP-24013', employeeId: 'EMP-24013', nameTh: 'เกรียงไกร มีพรพิพัฒน์', nameEn: 'Kriangkrai Meepornpipat',
    name: 'เกรียงไกร มีพรพิพัฒน์ (Kriangkrai Meepornpipat)', nickName: 'เกรียง (Krieng)',
    image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
    section: 'Cyber Security', jobTitle: 'Security Analyst', position: 'Security Analyst',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2023-01-15', hiringDate: '2023-01-15', hireDate: '2023-01-15',
    yos: '3 Yrs 5 Mos', idCard: '1100500123413', socialSec: 'Active', gender: 'Male', birthDate: '1995-10-30',
    age: 30, ageHiring: 27, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'Completed', driving: 'Car License',
    email: 'kriangkrai.m@chaisri.com', phone: '082-567-8901', addressId: '909/11 Lat Phrao, Bangkok', addressPres: 'Same as ID',
    emerContact: 'Sudarat Meepornpipat (Sister)', emerPhone: '085-123-4567', blood: 'B', education: 'Bachelor Degree', major: 'Computer Engineering',
    bank: 'SCB', bankAcc: '123-4-90123-4', termination: '', reason: ''
  },
  { 
    id: 14, staffId: 'EMP-24014', employeeId: 'EMP-24014', nameTh: 'พัชราภรณ์ วงศ์สุวรรณ', nameEn: 'Patcharaporn Wongsuwan',
    name: 'พัชราภรณ์ วงศ์สุวรรณ (Patcharaporn Wongsuwan)', nickName: 'พัช (Pat)',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Finance & Accounting', department: 'Finance & Accounting',
    section: 'Accounts Payable', jobTitle: 'Junior Accountant', position: 'Junior Accountant',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2025-02-01', hiringDate: '2025-02-01', hireDate: '2025-02-01',
    yos: '1 Yr 4 Mos', idCard: '1100500123414', socialSec: 'Active', gender: 'Female', birthDate: '2000-05-12',
    age: 26, ageHiring: 25, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'None',
    email: 'patcharaporn.w@chaisri.com', phone: '083-678-9012', addressId: '111/22 Sukhumvit Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Prasit Wongsuwan (Father)', emerPhone: '086-456-7890', blood: 'A', education: 'Bachelor Degree', major: 'Accounting',
    bank: 'SCB', bankAcc: '123-4-01234-5', termination: '', reason: ''
  },
  { 
    id: 15, staffId: 'EMP-24015', employeeId: 'EMP-24015', nameTh: 'สมชาย รักดี', nameEn: 'Somchai Rakdee',
    name: 'สมชาย รักดี (Somchai Rakdee)', nickName: 'สมชาย (Somchai)',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    office: 'Headquarters', dept: 'Human Resources', department: 'Human Resources',
    section: 'HR Operations', jobTitle: 'HR Manager', position: 'HR Manager',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2019-06-15', hiringDate: '2019-06-15', hireDate: '2019-06-15',
    yos: '7 Yrs', idCard: '1100500123415', socialSec: 'Active', gender: 'Male', birthDate: '1990-06-05',
    age: 36, ageHiring: 29, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
    email: 'somchai.r@chaisri.com', phone: '084-789-0123', addressId: '222/33 Rama 3 Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Somsri Rakdee (Wife)', emerPhone: '087-567-8901', blood: 'O', education: 'Bachelor Degree', major: 'Human Resource Management',
    bank: 'KBank', bankAcc: '012-3-01234-5', termination: '', reason: ''
  },
  { 
    id: 16, staffId: 'EMP-24016', employeeId: 'EMP-24016', nameTh: 'จิรายุ ทองแท้', nameEn: 'Jirayu Thongtae',
    name: 'จิรายุ ทองแท้ (Jirayu Thongtae)', nickName: 'เจ (Jay)',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Production', department: 'Production',
    section: 'Assembly', jobTitle: 'Assembly Supervisor', position: 'Assembly Supervisor',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2020-03-01', hiringDate: '2020-03-01', hireDate: '2020-03-01',
    yos: '6 Yrs 3 Mos', idCard: '1100500123416', socialSec: 'Active', gender: 'Male', birthDate: '1992-04-10',
    age: 34, ageHiring: 28, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
    email: 'jirayu.t@chaisri.com', phone: '085-890-1234', addressId: '333/44 Suksawat Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Thongdee Thongtae (Father)', emerPhone: '088-678-9012', blood: 'B', education: 'High School', major: 'General Science',
    bank: 'BBL', bankAcc: '234-5-01234-5', termination: '', reason: ''
  },
  { 
    id: 17, staffId: 'EMP-24017', employeeId: 'EMP-24017', nameTh: 'อรทัย เจริญยิ่ง', nameEn: 'Orathai Charoenying',
    name: 'อรทัย เจริญยิ่ง (Orathai Charoenying)', nickName: 'ปลา (Pla)',
    image: 'https://images.unsplash.com/photo-1563306406-e66174fa3787?auto=format&fit=crop&w=150&q=80',
    avatar: 'https://images.unsplash.com/photo-1563306406-e66174fa3787?auto=format&fit=crop&w=150&q=80',
    office: 'Factory A', dept: 'Quality Assurance', department: 'Quality Assurance',
    section: 'QA Admin', jobTitle: 'QA Coordinator', position: 'QA Coordinator',
    jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2024-05-15', hiringDate: '2024-05-15', hireDate: '2024-05-15',
    yos: '2 Yrs 1 Mo', idCard: '1100500123417', socialSec: 'Active', gender: 'Female', birthDate: '1997-08-22',
    age: 28, ageHiring: 26, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
    email: 'orathai.c@chaisri.com', phone: '086-901-2345', addressId: '444/55 Charan Sanitwong Rd., Bangkok', addressPres: 'Same as ID',
    emerContact: 'Somboon Charoenying (Father)', emerPhone: '089-789-0123', blood: 'AB', education: 'Bachelor Degree', major: 'Food Chemistry',
    bank: 'SCB', bankAcc: '123-4-12345-6', termination: '', reason: ''
  }
];

const EMPTY_EMPLOYEE = {
  staffId: '', nameTh: '', nameEn: '', nickName: '', image: '',
  office: 'Headquarters', dept: 'Information Technology', section: '', jobTitle: '', jobStatus: 'Permanent', workStatus: 'Active', 
  effDate: '', hiringDate: '', yos: '', idCard: '', socialSec: 'Active', gender: 'Male', 
  birthDate: '', age: '', ageHiring: '', nationality: 'Thai', religion: 'Buddhism', 
  marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License', email: '', phone: '',
  addressId: '', addressPres: 'Same as ID', emerContact: '', emerPhone: '', blood: 'A', health: '',
  education: 'Bachelor Degree', major: '', bank: 'KBank', bankAcc: '', termination: '', reason: ''
};

const KpiCard = ({ icon, value, label, colorAccent, colorValue, desc }: any) => (
    <div className="bg-white/90 px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm min-w-[200px] relative overflow-hidden group hover:border-[#b7a159] transition-all flex flex-col justify-between animate-fadeIn pb-6 flex-1 min-h-0">
        <div className="absolute -right-4 -bottom-6 opacity-[0.05] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <LucideIcon name={icon} size={110} color={colorAccent} />
        </div>
        <div className="relative z-10 flex justify-between items-start w-full">
            <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-[0.1em] drop-shadow-sm">{label}</p>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:rotate-6`} style={{backgroundColor: `${colorAccent}15`, borderColor: `${colorAccent}25`, color: colorAccent}}>
                <LucideIcon name={icon} size={20} />
            </div>
        </div>
        <div className="relative z-10 mt-2 flex items-end justify-between">
            <p className="text-[28px] font-black leading-none text-[#212c46]" style={{color: colorValue}}>
                {value}
            </p>
            <span className="text-[11px] font-bold text-[#4d87a8] uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span> {desc}
            </span>
        </div>
    </div>
);

function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-2 border-[#b7a159] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#b7a159] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-lg"><Icons.BookOpen size={22} className="text-[#b7a159]"/> DIRECTORY DIRECTIVE</h3>
            <p className="text-[12px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1.5">Workforce Profile Management</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"><Icons.X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white">
          <section className="animate-fadeIn">
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.ShieldAlert size={18} className="text-[#b7a159]"/> 1. ระบบประวัติและการบังคับใช้ PDPA
            </h4>
            <p className="text-[12px] mb-3">
              ข้อมูลพนักงานทุกคนภายใต้โครงสร้างบริษัท **ชัยศรีอะโกรอินดัสเทรียล** ถือเป็นข้อมูลจำกัดสิทธิ์ขั้นสูง (Highly Confidential) ระบบนี้ทำหน้าที่เก็บข้อมูลรายบุคคลประกอบไปด้วย 4 มิติสำคัญ:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[12px]">
                <li><strong className="text-[#4d87a8]">Basic Info (ประวัติทั่วไป):</strong> ชือไทย-อังกฤษ, บัตรประชาชน, อายุ, สัญชาติ และเพศสภาพ</li>
                <li><strong className="text-[#b58c4f]">Work Detail (การทำงาน):</strong> วันเริ่มงาน, ตำแหน่งงาน, สังกัดหน่วย และข้อมูลบัญชีรับเงินเดือน</li>
                <li><strong className="text-[#657f4d]">Contact Route (การติดต่อ):</strong> เบอร์โทรศัพท์, อีเมลทางการ และข้อมูลที่อยู่พำนักจริง</li>
                <li><strong className="text-[#932c2e]">Health & Education (สุขภาพ/การศึกษา):</strong> ประวัติการศึกษา, ทหาร, โรคประจำตัว และญาติกรณีติดต่อฉุกเฉิน</li>
            </ul>
          </section>
          
          <section className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.ClipboardList size={18} className="text-[#d96245]"/> 2. ระบบ Multi-step Wizard
            </h4>
            <p className="text-[12px] mb-3">การจัดเก็บ ป้อน และพูนข้อมูลพนักงานใหม่-เก่า จะใช้กระบวนการ 4 ขั้นตอนแบ่งแยกตามเมนูด้านซ้ายในหน้าต่างจัดการประวัติเพื่อลดความผิดพลาดในการป้อนข้อมูลเอกสารทางการ:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 font-semibold">
                <div className="p-3 bg-slate-50 border border-[#eaeaec] rounded-xl text-[#212c46]">👥 Step 1: ประวัติเบื้องต้น</div>
                <div className="p-3 bg-slate-50 border border-[#eaeaec] rounded-xl text-[#212c46]">💼 Step 2: ตำแหน่ง & สวัสดิการ</div>
                <div className="p-3 bg-slate-50 border border-[#eaeaec] rounded-xl text-[#212c46]">📍 Step 3: ที่อยู่ติดต่อ</div>
                <div className="p-3 bg-slate-50 border border-[#eaeaec] rounded-xl text-[#212c46]">🎓 Step 4: วุฒิ & ข้อมูลติดต่อฉุกเฉิน</div>
            </div>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.CheckSquare size={18} className="text-[#3f809e]"/> 3. สถิติพนักงานและหัวหน้างานประสานงาน
            </h4>
            <p className="text-[12px]">
              แผงควบคุม KPI ประเมินสถิติรวม (Headcount), พนักงานที่มีสถานะ Active ถือครองตารางปัจจุบัน รวมถึงสามารถส่งออกข้อมูลประวัติครอบคลุมการตรวจสอบจากฝ่ายทรัพยากรบุคคลแบบบูรณาการ
            </p>
          </section>
        </div>
        
        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-[#212c46] text-white font-black rounded-xl uppercase text-[12px] hover:bg-[#414757] hover:text-white transition-all shadow-md tracking-[0.1em] cursor-pointer">รับทราบระเบียบ (Acknowledge)</button>
        </div>
      </div>
    </>, document.body
  );
}

function EmployeeModal({ isOpen, onClose, emp, onSave }: any) {
    const [modalStep, setModalStep] = useState(0);
    const [formData, setFormData] = useState<any>(EMPTY_EMPLOYEE);

    useEffect(() => {
        if (isOpen) {
            setModalStep(0);
            if (emp) {
                setFormData({ ...emp });
            } else {
                setFormData({ ...EMPTY_EMPLOYEE });
            }
        }
    }, [isOpen, emp]);

    if (!isOpen) return null;

    const handleFieldChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.staffId || !formData.nameTh || !formData.nameEn || !formData.dept || !formData.jobTitle) {
            Swal.fire({
                icon: 'warning',
                title: 'กรอกข้อมูลที่จำเป็นไม่ครบถ้วน',
                text: 'กรุณากรอก รหัสพนักงาน, ชื่อไทย-อังกฤษ, ฝ่าย และตำแหน่งงาน ให้ครบถ้วนในแถบประวัติ',
                confirmButtonColor: '#212c46'
            });
            return;
        }
        onSave(formData);
        onClose();
        MySwal.fire({
            icon: 'success',
            title: emp ? 'แก้ไขข้อมูลพนักงานสำเร็จ' : 'ขึ้นทะเบียนพนักงานใหม่สำเร็จ',
            html: `ประวัติคุณ <b>${formData.nameEn}</b> ได้รับรอบการปรับปรุงบนฐานข้อมูล SMART LAW เรียบร้อยแล้ว`,
            confirmButtonColor: '#212c46'
        });
    };

    const InputBlock = ({ label, name, type = "text", req = false }: any) => (
        <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">{label} {req && <span className="text-[#932c2e]">*</span>}</label>
            <input 
                type={type} 
                value={formData[name] || ''} 
                onChange={e => handleFieldChange(name, e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
            />
        </div>
    );

    const SelectBlock = ({ label, name, options, req = false }: any) => (
        <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">{label} {req && <span className="text-[#932c2e]">*</span>}</label>
            <select 
                value={formData[name] || ''} 
                onChange={e => handleFieldChange(name, e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159]"
            >
                {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-[950px]"
            customHeader={
                <div className="bg-[#212c46] px-4 py-3 flex justify-between items-center shrink-0 border-b-2 border-[#b7a159]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm overflow-hidden">
                            <Users size={18} className="text-[#b7a159]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#d7d7d7] uppercase tracking-widest leading-none mb-1">{emp ? 'EDIT PROFILE CARD' : 'REGISTER NEW STAFF'}</h3>
                            <p className="text-[10px] font-bold text-[#b7a159]/90 uppercase tracking-widest mt-0.5">Corporate Employee Registry Node</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={16} /></button>
                </div>
            }
        >
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa] min-h-[460px]">
                {/* Steps Navigator */}
                <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] flex flex-row md:flex-col shrink-0 flex-wrap sm:flex-nowrap">
                    <div className="hidden md:block px-4 py-4 text-[10px] font-black text-[#7a8b95] uppercase tracking-widest border-b border-[#eaeaec] bg-[#f8f9fa]">Profile Segments</div>
                    {[0, 1, 2, 3].map(step => (
                        <button 
                            key={step} 
                            type="button"
                            onClick={() => setModalStep(step)} 
                            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-left transition-all md:border-l-4 ${modalStep === step ? 'border-b-4 md:border-b-0 border-[#b7a159] bg-[#f8f9fa] text-[#212c46]' : 'border-transparent text-[#7a8b95] hover:bg-[#f8f9fa]/50'}`}
                        >
                            <LucideIcon name={step === 0 ? 'User' : step === 1 ? 'Briefcase' : step === 2 ? 'MapPin' : 'GraduationCap'} size={15} color={modalStep === step ? THEME.brightGold : undefined} />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                                STEP {step + 1}: {step === 0 ? 'BASIC INFO' : step === 1 ? 'WORK INFO' : step === 2 ? 'CONTACT' : 'BACKGROUND'}
                            </span>
                        </button>
                    ))}
                    
                    {/* Img Box sidebar view */}
                    <div className="hidden md:block p-4 mt-auto border-t border-[#eaeaec]">
                        <div className="w-full aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-[#eaeaec] relative overflow-hidden group flex flex-col items-center justify-center text-center">
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" alt="Staff Portrait" />
                            ) : (
                                <div className="p-3 text-slate-300">
                                    <Camera size={28} className="mx-auto" />
                                    <span className="text-[9px] font-black uppercase tracking-widest block mt-2 text-[#7a8b95]">UPLOAD PICTURE</span>
                                </div>
                            )}
                            <button 
                                type="button"
                                onClick={() => {
                                    MySwal.fire({
                                        title: 'กำหนดลิ้งก์ภาพพนักงาน / Photo URL',
                                        input: 'url',
                                        inputPlaceholder: 'https://images.unsplash.com/photo-...',
                                        inputValue: formData.image || '',
                                        showCancelButton: true,
                                        confirmButtonText: 'ยืนยันรูปภาพ',
                                        confirmButtonColor: '#212c46'
                                    }).then(res => {
                                        if (res.isConfirmed && res.value) {
                                            handleFieldChange('image', res.value);
                                        }
                                    });
                                }}
                                className="absolute inset-0 bg-[#212c46]/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[9px] font-black tracking-widest gap-1"
                            >
                                <UploadCloud size={18} /> Update Image
                            </button>
                        </div>
                    </div>
                </div>

                {/* Step contents */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                    {modalStep === 0 && (
                        <div className="space-y-4 max-w-2xl animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ข้อมูลเบื้องต้นพนักงาน (Basic Personal Data)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputBlock label="รหัสพนักงาน / Staff ID" name="staffId" req />
                                <InputBlock label="ชื่อทางการคู่เอกสาร (ภาษาไทย)" name="nameTh" req />
                                <InputBlock label="Fullname (English Documented)" name="nameEn" req />
                                <InputBlock label="ชื่อเล่นพนักงาน (Nick Name)" name="nickName" />
                                <SelectBlock label="เพศโดยโครงสร้าง (Gender)" name="gender" options={['Male', 'Female', 'Other']} />
                                <InputBlock label="เลขบัตรประจำตัวประชาชน / ID Card" name="idCard" req />
                                <InputBlock label="วัน/เดือน/ปีเกิด (Birth Date)" name="birthDate" type="date" />
                                <div className="grid grid-cols-2 gap-2">
                                    <InputBlock label="อายุ (Age)" name="age" type="number" />
                                    <InputBlock label="สัญชาติ" name="nationality" />
                                </div>
                                <SelectBlock label="ศาสนา (Religion)" name="religion" options={['Buddhism', 'Christianity', 'Islam', 'Other']} />
                                <SelectBlock label="สถานภาพสมรส" name="marital" options={['Single', 'Married', 'Divorced']} />
                            </div>
                        </div>
                    )}

                    {modalStep === 1 && (
                        <div className="space-y-4 max-w-2xl animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">สถานะการทำงานและแผนกสังกัด (Employment Assignments)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectBlock label="สำนักงานประจำการ / Office Branch" name="office" options={['Headquarters', 'Factory A', 'Warehouse B']} req />
                                <SelectBlock label="สังกัดฝ่าย / Dept" name="dept" options={['Human Resources', 'Information Technology', 'Quality Assurance', 'Production', 'Warehouse & Logistics']} req />
                                <InputBlock label="กลุ่ม/สายงานวิกฤต (Section)" name="section" />
                                <InputBlock label="ตำแหน่งงานทางการ (Job Title)" name="jobTitle" req />
                                <SelectBlock label="รูปแบบการจ้าง" name="jobStatus" options={['Permanent', 'Probation', 'Contract', 'Intern']} />
                                <InputBlock label="วันเริ่มจ้างงาน (Hiring Date)" name="hiringDate" type="date" req />
                                <InputBlock label="วันที่มีผลบังคับใช้รอบสิทธิ์ (Eff Date)" name="effDate" type="date" />
                                <InputBlock label="อายุงาน ณ ปัจจุบัน (YOS)" name="yos" />
                                <SelectBlock label="สถานะการประจำการ / Status" name="workStatus" options={['Active', 'Resigned', 'Suspended']} req />
                            </div>

                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mt-6 mb-4">สวัสดิการ บัญชีรับรายได้ และประกันสังคง</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectBlock label="ประกันสังคม / Social Security" name="socialSec" options={['Active', 'Pending', 'N/A']} />
                                <SelectBlock label="ธนาคารรับพาสยอด" name="bank" options={['KBank', 'SCB', 'BBL', 'KTB', 'Krungsri']} />
                                <InputBlock label="เลขบัญชีธนาคารพนักงาน" name="bankAcc" />
                            </div>

                            {formData.workStatus === 'Resigned' && (
                                <div className="space-y-4 border-l-2 border-[#932c2e] pl-4 mt-6">
                                    <h4 className="text-[12.4px] font-black text-[#932c2e] uppercase tracking-widest">ข้อมูลการลาออกจากงาน / Termination Nodes</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InputBlock label="วันสุดท้ายของการทำงาน" name="termination" type="date" />
                                        <div>
                                            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">เหตุผลการยุติบทบาทการทำงาน</label>
                                            <textarea 
                                                value={formData.reason || ''} 
                                                onChange={e => handleFieldChange('reason', e.target.value)}
                                                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] h-16 outline-none focus:border-[#b7a159]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {modalStep === 2 && (
                        <div className="space-y-4 max-w-2xl animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ช่องทางติดต่อพนักงาน (Address & Contacts Route)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputBlock label="เบอร์โทรศัพท์ติดต่อพนักงาน / Mobile" name="phone" req />
                                <InputBlock label="ที่อยู่อีเมลประสานงาน (Corporate Email)" name="email" type="email" />
                            </div>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ที่อยู่ตามระเบียนบัตรประชาชน (Document ID Address) *</label>
                                    <textarea 
                                        value={formData.addressId || ''} 
                                        onChange={e => handleFieldChange('addressId', e.target.value)}
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-3 text-[12px] font-bold text-[#212c46] h-16 outline-none focus:border-[#b7a159]"
                                        placeholder="ระบุบ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ และจังหวัด..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ที่อยู่ที่ใช้พักพิงประจำการจริงปัจจุบัน (Current Present Address) *</label>
                                    <div className="flex gap-2 mb-2">
                                        <button 
                                            type="button" 
                                            onClick={() => handleFieldChange('addressPres', 'Same as ID')}
                                            className="px-3 py-1 bg-slate-100 border border-slate-200 text-[#212c46] hover:bg-slate-200 rounded-lg text-[9.5px] font-black uppercase tracking-widest"
                                        >
                                            ใช้ที่อยู่เดียวกันกับบัตรประชาชน
                                        </button>
                                    </div>
                                    <textarea 
                                        value={formData.addressPres || ''} 
                                        onChange={e => handleFieldChange('addressPres', e.target.value)}
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-3 text-[12px] font-bold text-[#212c46] h-16 outline-none focus:border-[#b7a159]"
                                        placeholder="ที่อยู่ปัจจุบัน..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 3 && (
                        <div className="space-y-4 max-w-2xl animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ประวัติการศึกษา ประวัติทหาร และข้อมูลฉุกเฉิน (Credentials & Disaster Plan)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectBlock label="ระดับการศึกษาสูงสุด / Edu Level" name="education" options={['High School', 'Vocational', 'Bachelor Degree', 'Master Degree', 'PhD']} />
                                <InputBlock label="สาขาวิชาและสถาบันหลัก (Major / Minor)" name="major" />
                                <SelectBlock label="ใบขับขี่ใบอนุญาตขับรถ (Driving)" name="driving" options={['Car License', 'Motorcycle License', 'Both', 'None']} />
                                <SelectBlock label="ระเบียบบริการทหาร (สำหรับบุรุษ)" name="military" options={['Completed', 'Exempted', 'Not Yet', 'N/A']} />
                                <SelectBlock label="กรุ๊ปเลือดพนักงาน (Blood Type)" name="blood" options={['A', 'B', 'AB', 'O']} />
                                <InputBlock label="โรคประจำตัว หรือประวัติแพ้ยาป้อน" name="health" />
                                <InputBlock label="ผู้ติดต่อกรณีฉุกเฉิน (Emergency Target Name)" name="emerContact" req />
                                <InputBlock label="เบอร์ติดต่อกรณีฉุกเฉิน / Phone" name="emerPhone" req />
                            </div>

                            <div className="p-4 bg-[#fcf4f2] border border-[#eedbe2] rounded-2xl flex items-start gap-3 mt-4">
                                <ShieldCheck className="text-[#a94228] shrink-0 mt-0.5" size={18} />
                                <p className="text-[11.5px] text-[#7a8b95] font-bold leading-relaxed">
                                    การปรับเปลี่ยนประวัติพนักงานดิจิทัลมีผลกระทบแบบ Real-time ตารางความปลอดภัยพนักงาน PDPA และกำหนดการสิทธิ์การจ่ายกะพนักงานของ ชัยศรีอะโกรอินดัสเทรียล ทุกจุดอย่างถูกต้อง
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end gap-3 shrink-0">
                <button onClick={onClose} className="px-5 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleSave} className="bg-[#212c46] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] hover:text-white transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Profile</button>
            </div>
        </DraggableModal>
    );
}

export default function EmployeeDirectory() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterOffice, setFilterOffice] = useState('');
  const [filterWorkStatus, setFilterWorkStatus] = useState('');
  const [filterJobStatus, setFilterJobStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; user: any }>({ isOpen: false, user: null });
  const [toast, setToast] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Load from dbSync (Firestore primary, GAS Sheet secondary, LocalStorage seed tertiary)
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        console.log("[Directory] Loading employees from dbSync...");
        const response = await dbSync.read('employees');
        if (response && response.status === 'success' && response.data && Array.isArray(response.data.items)) {
          let loaded = response.data.items;
          if (loaded.length === 0) {
            console.log("[Directory] Database empty. Seeding INITIAL_EMPLOYEES...");
            await dbSync.write('employees', INITIAL_EMPLOYEES);
            setUsers(INITIAL_EMPLOYEES);
            localStorage.setItem('local_employee_directory', JSON.stringify(INITIAL_EMPLOYEES));
          } else {
            const items = loaded.map((u: any) => ({
              ...u,
              id: isNaN(u.id) ? u.id : Number(u.id)
            }));
            setUsers(items);
            localStorage.setItem('local_employee_directory', JSON.stringify(items));
          }
        } else {
          setUsers(INITIAL_EMPLOYEES);
        }
      } catch (err) {
        console.error("Failed to load employees from dbSync:", err);
        setUsers(INITIAL_EMPLOYEES);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const saveToStorage = (newRecords: any[]) => {
      setUsers(newRecords);
      localStorage.setItem('local_employee_directory', JSON.stringify(newRecords));
  };

  // Unique Filtering Lists
  const deptCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      users.forEach(u => { counts[u.dept] = (counts[u.dept] || 0) + 1; });
      return counts;
  }, [users]);

  const departmentCounts = useMemo(() => {
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  }, [deptCounts]);

  const CHART_COLORS = [
    '#254268', // Deep corporate Navy
    '#b58c4f', // Warm golden
    '#5f7ab7', // Sky Blue accent
    '#a73527', // Alert contrast
    '#657f4d', // Soft Sage Green
    '#748ea1', // Clean Slate
  ];

  const officeCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      users.forEach(u => { counts[u.office] = (counts[u.office] || 0) + 1; });
      return counts;
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
      return users.filter(u => {
          const searchStr = search.toLowerCase();
          const matchSearch = searchStr === '' || (
              u.nameTh?.toLowerCase().includes(searchStr) || 
              u.nameEn?.toLowerCase().includes(searchStr) || 
              u.staffId?.toLowerCase().includes(searchStr) ||
              u.dept?.toLowerCase().includes(searchStr) ||
              u.jobTitle?.toLowerCase().includes(searchStr) ||
              u.phone?.toLowerCase().includes(searchStr) ||
              u.email?.toLowerCase().includes(searchStr)
          );
          
          const matchDept = filterDept === '' || u.dept === filterDept;
          const matchOffice = filterOffice === '' || u.office === filterOffice;
          const matchWorkStatus = filterWorkStatus === '' || u.workStatus === filterWorkStatus;
          const matchJobStatus = filterJobStatus === '' || u.jobStatus === filterJobStatus;

          return matchSearch && matchDept && matchOffice && matchWorkStatus && matchJobStatus;
      });
  }, [users, search, filterDept, filterOffice, filterWorkStatus, filterJobStatus]);

  const currentData = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  // KPI Calculations
  const totalHeadcount = users.length;
  const activePersonnel = users.filter(u => u.workStatus === 'Active').length;
  const draftPersonnel = users.filter(u => u.workStatus !== 'Active').length;
  const distinctDeptsCount = new Set(users.map(u => u.dept)).size;

  // Handlers
  const handleOpenModal = (user = null) => setModalState({ isOpen: true, user });

  const handleSaveUser = async (userData: any) => {
      try {
          if (userData.id) {
              // Edit Mode
              const updatedItem = {
                ...userData,
                id: isNaN(userData.id) ? userData.id : Number(userData.id),
                name: `${userData.nameTh || ''} (${userData.nameEn || ''})`.trim(),
                employeeId: userData.staffId || userData.employeeId,
                status: userData.workStatus || userData.status,
                position: userData.jobTitle || userData.position,
                department: userData.dept || userData.department,
                avatar: userData.image || userData.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
                image: userData.image || userData.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
                isActive: userData.workStatus === 'Active'
              };
              
              const updatedList = users.map(u => u.id === userData.id ? updatedItem : u);
              saveToStorage(updatedList);
              await dbSync.update('employees', [updatedItem]);
              
              Swal.fire({
                  icon: 'success',
                  title: 'สำเร็จ',
                  text: 'บันทึกแก้ไขข้อมูลประวัติพนักงานเรียบร้อยแล้ว',
                  confirmButtonColor: '#212c46'
              });
          } else {
              // Create Mode
              const maxId = users.length > 0 ? Math.max(...users.map(u => isNaN(u.id) ? 0 : Number(u.id))) : 0;
              const newId = maxId + 1;
              const newItem = {
                ...userData,
                id: newId,
                name: `${userData.nameTh || ''} (${userData.nameEn || ''})`.trim(),
                employeeId: userData.staffId || userData.employeeId,
                status: userData.workStatus || userData.status,
                position: userData.jobTitle || userData.position,
                department: userData.dept || userData.department,
                avatar: userData.image || userData.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
                image: userData.image || userData.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
                isActive: userData.workStatus === 'Active'
              };
              
              const updatedList = [...users, newItem];
              saveToStorage(updatedList);
              await dbSync.write('employees', [newItem]);
              
              Swal.fire({
                  icon: 'success',
                  title: 'สำเร็จ',
                  text: 'บันทึกประวัติพนักงานใหม่เรียบร้อยแล้ว',
                  confirmButtonColor: '#212c46'
              });
          }
      } catch (err) {
          console.error("Failed to save employee to dbSync:", err);
          Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาดในการบันทึก',
              text: 'ไม่สามารถบันทึกลง Google Sheet และ Firebase ได้ในขณะนี้ ระบบจัดเก็บเฉพาะที่',
              confirmButtonColor: '#212c46'
          });
      }
  };

  const handleDelete = (id: number) => {
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) return;
      MySwal.fire({
          title: 'ลบข้อมูลประวัติพนักงานหรือไม่?',
          text: `คุณต้องการลบข้อมูลประวัติทั้งหมดของคุณ ${targetUser.nameEn} สมบูรณ์จากระบบ SMART LAW ใช่หรือไม่? ข้อมูลนี้ไม่สามารถกู้คืนได้`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ลบบันทึก',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#932c2e',
          cancelButtonColor: '#7a8b95'
      }).then(async (result) => {
          if (result.isConfirmed) {
              try {
                  const updatedList = users.filter(u => u.id !== id);
                  saveToStorage(updatedList);
                  await dbSync.delete('employees', [{ id }]);
                  Swal.fire({
                      icon: 'success',
                      title: 'ลบเรียบร้อยแล้ว',
                      text: 'ระบบทำการลบประวัติพนักงานออกเรียบร้อยสมบูรณ์ ทั้งระบบริการและฐานข้อมูลบนคลาวด์',
                      confirmButtonColor: '#212c46'
                  });
              } catch (err) {
                  console.error("Failed to delete employee from dbSync:", err);
                  Swal.fire({
                      icon: 'error',
                      title: 'จำกัดขอบข่ายการลบข้อมูล',
                      text: 'ไม่สามารถลบข้อมูลจากคลาวด์ได้ขณะนี้ คอร์เน็ตเวิร์กออฟไลน์',
                      confirmButtonColor: '#212c46'
                  });
              }
          }
      });
  };

  const handleExportData = () => {
    Swal.fire({
        icon: 'info',
        title: 'ออกรายงานประวัติพนักงาน',
        text: 'ระบบกำลังดึงข้อมูลพนักงานทั้งหมดเพื่อนำส่งเข้ารอบ PDF/Excel คลาวด์ของบริษัท',
        confirmButtonColor: '#212c46'
    });
  };

  return (
    <div className="flex flex-1 h-full min-h-0 w-full flex-col animate-fadeIn bg-transparent pb-6">
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
          <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
              <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
              <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
          </button>,
          document.body
      )}

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EmployeeModal isOpen={modalState.isOpen} onClose={() => setModalState({isOpen: false, user: null})} emp={modalState.user} onSave={handleSaveUser} />

      {/* HEADER SECTION --- Permissions Page Layout Match */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
                      <Icons.Users size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none font-exception-header" style={{ fontSize: '24px' }}>
                      EMPLOYEE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">DIRECTORY</span> NODE
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      CENTRALIZED DIGITAL PROFILES & WORKFORCE INFORMATION MANAGEMENT HUB
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
              <button 
                  onClick={handleExportData} 
                  className="hidden lg:flex items-center gap-2 bg-white/80 border border-[#eaeaec] text-[#212c46] hover:bg-[#f8f9fa] py-2.5 px-6 rounded-full text-[11px] uppercase font-black tracking-widest shadow-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                  <Download size={14} className="text-[#b58c4f]" /> {t('Export Profiles')}
              </button>
          </div>
      </div>

      <div className="px-8 w-full mt-[8px] flex flex-col flex-1 min-h-0">
        <div className="w-full h-full flex flex-col flex-1 space-y-4 min-h-0">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <KpiCard label={t('Overall Headcount')} value={totalHeadcount} icon="users" colorAccent={THEME.primaryLight} colorValue={THEME.primary} desc={t('Rostered Profiles')} />
                <KpiCard label={t('Active Personnel')} value={activePersonnel} icon="shield-check" colorAccent={THEME.success} colorValue={THEME.success} desc={t('On Duty')} />
                <KpiCard label={t('Offboarding/Draft')} value={draftPersonnel} icon="alert-triangle" colorAccent={THEME.danger} colorValue={THEME.danger} desc={t('Off / Resigned')} />
                <KpiCard label={t('Departments')} value={distinctDeptsCount} icon="workflow" colorAccent={THEME.gold} colorValue={THEME.primary} desc={t('Active Branches')} />
            </div>

            {/* ANALYTICS HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
              <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-[#eaeaec] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#212c46] uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Icons.BarChart2 size={16} className="text-[#3f809e]" /> {t('Headcount by Department')}
                  </h4>
                  <p className="text-[9px] text-[#748ea1] font-black uppercase tracking-widest mb-4">{t('Departmental staff distribution')}</p>
                </div>
                <div className="h-48 flex items-center justify-center">
                  {departmentCounts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={departmentCounts}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {departmentCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold uppercase">{t('No headcount statistics')}</span>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#f3f3f1] rounded-3xl p-5 border border-[#eaeaec] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#212c46] uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Icons.CheckCircle2 size={16} className="text-[#657f4d]" /> {t('Departmental Presence Density')}
                  </h4>
                  <p className="text-[9px] text-[#748ea1] font-black uppercase tracking-widest mb-4">{t('Rostered personnel count by specific active teams')}</p>
                </div>
                <div className="space-y-3">
                  {departmentCounts.map((item, i) => {
                    const percentage = totalHeadcount > 0 ? Math.round((item.value / totalHeadcount) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-4 group/bar">
                        <div className="w-32 text-[9px] font-black text-[#435665] uppercase truncate tracking-tight">{item.name || 'Unassigned'}</div>
                        <div className="flex-1 h-3.5 rounded-lg relative flex items-center bg-slate-200/50 shadow-inner overflow-hidden">
                          <div className="h-full transition-all duration-1000 relative z-10 rounded-lg"
                            style={{ width: `${percentage}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-[10px] font-black text-[#212c46]">{item.value} ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MAIN DATA INTERACTIVE PORTAL CARD */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* ADVANCED TOOLBAR */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        
                        {/* CASCADING FILTER DROPDOWNS */}
                        <select 
                            value={filterDept} 
                            onChange={(e) => { setFilterDept(e.target.value); }} 
                            className="bg-white border border-[#eaeaec] rounded-full px-4 py-2.5 text-[11px] font-black outline-none focus:border-[#4d87a8] text-[#414757] shadow-sm cursor-pointer w-full sm:w-44 appearance-none"
                        >
                            <option value="">{t('All Depts')}</option>
                            {Object.keys(deptCounts).map(d => <option key={d} value={d}>{d} ({deptCounts[d] || 0})</option>)}
                        </select>

                        <select 
                            value={filterOffice} 
                            onChange={(e) => setFilterOffice(e.target.value)} 
                            className="bg-white border border-[#eaeaec] rounded-full px-4 py-2.5 text-[11px] font-black outline-none focus:border-[#4d87a8] text-[#414757] shadow-sm cursor-pointer w-full sm:w-44 appearance-none"
                        >
                            <option value="">{t('All Offices')}</option>
                            {Object.keys(officeCounts).map(o => <option key={o} value={o}>{o} ({officeCounts[o] || 0})</option>)}
                        </select>

                        <select 
                            value={filterJobStatus} 
                            onChange={(e) => setFilterJobStatus(e.target.value)} 
                            className="bg-white border border-[#eaeaec] rounded-full px-4 py-2.5 text-[11px] font-black outline-none focus:border-[#4d87a8] text-[#414757] shadow-sm cursor-pointer w-full sm:w-44 appearance-none"
                        >
                            <option value="">{t('All Contract Types')}</option>
                            <option value="Permanent">{t('Permanent')}</option>
                            <option value="Probation">{t('Probation')}</option>
                            <option value="Contract">{t('Contract')}</option>
                            <option value="Intern">{t('Intern')}</option>
                        </select>

                        <select 
                            value={filterWorkStatus} 
                            onChange={(e) => setFilterWorkStatus(e.target.value)} 
                            className="bg-white border border-[#eaeaec] rounded-full px-4 py-2.5 text-[11px] font-black outline-none focus:border-[#4d87a8] text-[#414757] shadow-sm cursor-pointer w-full sm:w-44 appearance-none"
                        >
                            <option value="">{t('All Status')}</option>
                            <option value="Active">{t('Active')}</option>
                            <option value="Resigned">{t('Resigned')}</option>
                            <option value="Suspended">{t('Suspended')}</option>
                        </select>

                        <div className="h-6 w-[2.5px] bg-[#eaeaec] hidden sm:block mx-1"></div>

                        {/* SEARCH INPUT */}
                        <div className="relative w-full sm:w-64">
                            <Icons.Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                            <input 
                                type="text" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder={t('Search by name, ID or title...')} 
                                className="w-full pl-11 pr-5 py-2.5 text-[11.5px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#4d87a8] bg-white shadow-sm text-[#212c46] transition-all" 
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 justify-end">
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="bg-[#212c46] text-white px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center justify-center gap-2 border border-[#212c46] cursor-pointer"
                        >
                            <Plus size={14} strokeWidth={3} /> {t('Add Employee')}
                        </button>
                    </div>
                </div>

                {/* EMPLOYEES DATA TABLE */}
                <div className="overflow-auto custom-scrollbar bg-white  flex-1 min-h-0">
                    <table className="w-full text-left font-sans border-collapse min-w-[1000px]">
                        <thead className="bg-[#212c46] text-white sticky top-0 z-10">
                            <tr className="border-b-2 border-[#b7a159]">
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap w-24 text-center">{t('Portrait')}</th>
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">{t('Staff Node Identity')}</th>
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">{t('Department & Office')}</th>
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">{t('Job Position')}</th>
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">{t('Contact & Mobile')}</th>
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] text-center w-36">{t('Status')}</th>
                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] text-center w-32">{t('Action')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {currentData.map((item) => (
                                <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-6 whitespace-nowrap text-center">
                                        <div className="w-11 h-11 rounded-full border border-[#eaeaec] bg-slate-50 overflow-hidden shadow-sm mx-auto flex items-center justify-center text-[#7a8b95]">
                                            {item.image ? (
                                                <img src={item.image} alt={item.nameEn} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icons.User size={18} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <p className="font-tech text-[#212c46] font-black text-[13px]">
                                                {item.staffId}
                                            </p>
                                            <p className="text-[12.4px] font-black text-[#b58c4f] uppercase tracking-tight mt-1">
                                                {item.nameEn} <span className="text-slate-400 font-sans font-bold text-[10px] ml-1">({item.nickName || t('No Nickname')})</span>
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black text-[#212c46] uppercase leading-none">{item.dept}</span>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase mt-1 flex items-center gap-1">
                                                <Building2 size={11} className="text-[#b7a159]"/> {item.office}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-6 whitespace-nowrap">
                                        <p className="text-[12px] font-bold text-[#414757] uppercase leading-none">{item.jobTitle}</p>
                                        <span className={`border font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full inline-block mt-1 font-tech
                                            ${item.jobStatus === 'Permanent' ? 'bg-[#212c46]/10 text-[#212c46] border-[#212c46]/20' : 
                                              item.jobStatus === 'Probation' ? 'bg-[#b58c4f]/15 text-[#b58c4f] border-[#b58c4f]/35' : 
                                              item.jobStatus === 'Contract' ? 'bg-[#3f809e]/10 text-[#3f809e] border-[#3f809e]/20' :
                                              'bg-purple-150 text-purple-700 border-purple-300'}`}>
                                            {t(item.jobStatus)}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[11.5px] font-mono font-bold text-[#212c46]">{item.phone}</span>
                                            <span className="text-[10.5px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                                                <Mail size={11} className="text-[#4d87a8]"/> {item.email || t('No documented email')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-6 text-center">
                                        <span className={`px-3 py-1 text-center inline-block min-w-[105px] rounded-full text-[10px] font-black uppercase tracking-widest border font-tech
                                            ${item.workStatus === 'Active' ? 'bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30' : 
                                              item.workStatus === 'Resigned' ? 'bg-[#932c2e]/10 text-[#932c2e] border-[#932c2e]/30' :
                                              'bg-amber-500/10 text-amber-700 border-amber-500/30'}`}>
                                            {t(item.workStatus)}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-6 text-center">
                                        <div className="flex justify-center items-center gap-1">
                                            <button 
                                                onClick={() => handleOpenModal(item)} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] hover:bg-[#3f809e]/10 hover:shadow-sm transition-all active:scale-90 cursor-pointer" 
                                                title="Edit Profile"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#932c2e] hover:bg-[#932c2e]/10 hover:shadow-sm transition-all active:scale-90 cursor-pointer" 
                                                title="Delete Profile"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentData.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-10 text-[#7a8b95] font-bold text-[12px]">No registered employee profiles found matching your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-3 bg-[#F0EAE1]/80 backdrop-blur-md border-t-[1.5px] border-[#adb2b0]/50 flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-[24px] shrink-0">
                    <div className="flex items-center gap-5 text-[11px] font-black text-[#606a5f] uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span>Display Rows:</span>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#939885]/40 rounded-lg px-2.5 py-1.5 outline-none font-black text-[#414757] cursor-pointer shadow-sm focus:border-[#4d87a8] focus:ring-1 focus:ring-[#4d87a8]/20">
                                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <p className="bg-white px-3.5 py-1.5 rounded-lg border border-[#939885]/40 shadow-sm font-tech">Total Records: {filteredUsers.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-9 h-9 border border-[#939885]/40 bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-sm active:scale-90'}`}>
                            <ChevronLeft size={16}/>
                        </button>
                        <div className="bg-white text-[#414757] px-4 py-2 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-[#939885]/40 shadow-sm font-tech">
                            Page {currentPage} / {totalPages}
                        </div>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-9 h-9 border border-[#939885]/40 bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-sm active:scale-90'}`}>
                            <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            </div>
            
            
        </div>
      </div>
    </div>
  );
}
