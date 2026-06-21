/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VisibilityProvider } from './context/ModuleVisibilityContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import PlaceholderPage from './pages/PlaceholderPage';
import UserPermissions from './pages/UserPermissions';
import DisciplinaryLaborLaw from './pages/Disciplinary/Law';
import DisciplinaryActions from './pages/Disciplinary/Actions';
import DisciplinaryInvestigation from './pages/Disciplinary/Investigation';
import WarningLettersPage from './pages/Disciplinary/WarningLettersPage';
import CompanyRegulations from './pages/Disciplinary/Regulations';
import EngagementRelationship from './pages/LaborRelations/Engagement';
import SportsSocialEvents from './pages/LaborRelations/Sports';
import UnionGrievances from './pages/LaborRelations/Union';
import TurnoverAnalysis from './pages/Reports/Turnover';
import BenefitsWelfare from './pages/Benefits/Welfare';
import AiCopilot from './pages/AiCopilot';
import DocSummarizer from './pages/DocSummarizer';
import HrCalendar from './pages/HrCalendar';
import DevPermit from './pages/DevPermit';
import SystemConfig from './pages/SystemConfig';
import SystemLogs from './pages/SystemLogs';
import NotificationCenter from './pages/NotificationCenter';
import Appraisals from './pages/Appraisals';
import LeaveManagement from './pages/LeaveManagement';
import Attendance from './pages/Attendance';
import ShiftSchedulesByDept from './pages/Attendance/ShiftSchedules';
import Overtime from './pages/Attendance/Overtime';
import EmployeeDirectory from './pages/Employees/Directory';
import SalaryMaster from './pages/Employees/SalaryMaster';
import Payslips from './pages/Payroll/Payslips';
import PayslipsHr from './pages/Payroll/PayslipsHr';
import Expenses from './pages/Payroll/Expenses';
import PayrollCalculation from './pages/Payroll/Calculation';
import Onboarding from './pages/Onboarding';
import Offboarding from './pages/Employees/Offboarding';
import CompanyHolidays from './pages/LeaveManagement/CompanyHolidays';
import Recruitment from './pages/Recruitment';
import JobOpenings from './pages/Recruitment/JobOpenings';
import InterviewSchedule from './pages/InterviewSchedule';
import InterviewAssessment from './pages/Interview';
import JDRepository from './pages/JobDescription/Repository';
import SkillMatrix from './pages/Talent/SkillMatrix';
import CareerPath from './pages/Talent/CareerPath';
import SuccessionPlan from './pages/Talent/SuccessionPlan';
import OrientationTraining from './pages/OrientationTraining';
import OjtTraining from './pages/OjtTraining';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <VisibilityProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              
              <Route path="/hr-calendar" element={
                <ProtectedRoute>
                  <HrCalendar />
                </ProtectedRoute>
              } />
              <Route path="/copilot" element={
                <ProtectedRoute>
                  <AiCopilot />
                </ProtectedRoute>
              } />
              <Route path="/doc-summarizer" element={
                <ProtectedRoute>
                  <DocSummarizer />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationCenter />
                </ProtectedRoute>
              } />
              
              {/* General Modules (Read-only by default) */}
              <Route path="/employees" element={
                <ProtectedRoute>
                  <EmployeeDirectory />
                </ProtectedRoute>
              } />
              <Route path="/employees/directory" element={
                <ProtectedRoute>
                  <EmployeeDirectory />
                </ProtectedRoute>
              } />
              <Route path="/employees/salary-master" element={
                <ProtectedRoute>
                  <SalaryMaster />
                </ProtectedRoute>
              } />
              <Route path="/employees/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/employees/offboarding" element={
                <ProtectedRoute>
                  <Offboarding />
                </ProtectedRoute>
              } />
              <Route path="/recruitment" element={
                <ProtectedRoute>
                  <Recruitment />
                </ProtectedRoute>
              } />
              <Route path="/recruitment/openings" element={
                <ProtectedRoute>
                  <JobOpenings />
                </ProtectedRoute>
              } />
              <Route path="/job-description/repository" element={
                <ProtectedRoute>
                  <JDRepository />
                </ProtectedRoute>
              } />
              <Route path="/talent/skill-matrix" element={
                <ProtectedRoute>
                  <SkillMatrix />
                </ProtectedRoute>
              } />
              <Route path="/talent/career-path" element={
                <ProtectedRoute>
                  <CareerPath />
                </ProtectedRoute>
              } />
              <Route path="/talent/succession-plan" element={
                <ProtectedRoute>
                  <SuccessionPlan />
                </ProtectedRoute>
              } />
              <Route path="/talent-dev/orientation" element={
                <ProtectedRoute>
                  <OrientationTraining />
                </ProtectedRoute>
              } />
              <Route path="/talent-dev/ojt" element={
                <ProtectedRoute>
                  <OjtTraining />
                </ProtectedRoute>
              } />
              <Route path="/recruitment/:tab" element={
                <ProtectedRoute>
                  <Recruitment />
                </ProtectedRoute>
              } />
              <Route path="/interview/schedule" element={
                <ProtectedRoute>
                  <InterviewSchedule />
                </ProtectedRoute>
              } />
              <Route path="/interview/list" element={
                <ProtectedRoute>
                  <InterviewAssessment />
                </ProtectedRoute>
              } />
              <Route path="/attendance" element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="/time-attendance/records" element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="/time-attendance/schedules" element={
                <ProtectedRoute>
                  <ShiftSchedulesByDept />
                </ProtectedRoute>
              } />
              <Route path="/time-attendance/overtime" element={
                <ProtectedRoute>
                  <Overtime />
                </ProtectedRoute>
              } />
              <Route path="/leave" element={
                <ProtectedRoute>
                  <LeaveManagement role="staff" />
                </ProtectedRoute>
              } />
              <Route path="/leave/hr" element={
                <ProtectedRoute>
                  <LeaveManagement role="hr" />
                </ProtectedRoute>
              } />
              <Route path="/leave/staff" element={
                <ProtectedRoute>
                  <LeaveManagement role="staff" />
                </ProtectedRoute>
              } />
              <Route path="/leave-management/holidays" element={
                <ProtectedRoute>
                  <CompanyHolidays />
                </ProtectedRoute>
              } />
              <Route path="/payroll" element={
                <Navigate to="/payroll/calculation" replace />
              } />
              <Route path="/payroll/salary" element={
                <Navigate to="/employees/salary-master" replace />
              } />
              <Route path="/payroll/calculation" element={
                <ProtectedRoute>
                  <PayrollCalculation />
                </ProtectedRoute>
              } />
              <Route path="/payroll/payslips" element={
                <ProtectedRoute>
                  <Payslips />
                </ProtectedRoute>
              } />
              <Route path="/payroll/payslips-hr" element={
                <ProtectedRoute>
                  <PayslipsHr />
                </ProtectedRoute>
              } />
              <Route path="/payroll/expenses" element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } />
              <Route path="/appraisals" element={
                <ProtectedRoute>
                  <Appraisals />
                </ProtectedRoute>
              } />
              <Route path="/performance/evaluation" element={
                <ProtectedRoute>
                  <Appraisals />
                </ProtectedRoute>
              } />
              <Route path="/reports/turnover" element={
                <ProtectedRoute>
                  <TurnoverAnalysis />
                </ProtectedRoute>
              } />
              <Route path="/benefits/welfare" element={
                <ProtectedRoute>
                  <BenefitsWelfare />
                </ProtectedRoute>
              } />

              {/* Confidential Modules */}
              <Route path="/dev-permit" element={
                <ProtectedRoute>
                  <DevPermit />
                </ProtectedRoute>
              } />
              <Route path="/dev-logs" element={
                <ProtectedRoute>
                  <SystemLogs />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute isConfidential>
                  <SystemConfig />
                </ProtectedRoute>
              } />
              <Route path="/permissions" element={
                <ProtectedRoute isConfidential>
                  <UserPermissions />
                </ProtectedRoute>
              } />
              <Route path="/disciplinary/law" element={
                <ProtectedRoute>
                  <DisciplinaryLaborLaw />
                </ProtectedRoute>
              } />
              <Route path="/disciplinary/regulations" element={
                <ProtectedRoute>
                  <CompanyRegulations />
                </ProtectedRoute>
              } />
              <Route path="/disciplinary/warning-letters" element={
                <ProtectedRoute>
                  <WarningLettersPage />
                </ProtectedRoute>
              } />
              <Route path="/disciplinary/actions" element={
                <ProtectedRoute>
                  <DisciplinaryActions />
                </ProtectedRoute>
              } />
              <Route path="/disciplinary/investigation" element={
                <ProtectedRoute>
                  <DisciplinaryInvestigation />
                </ProtectedRoute>
              } />
              <Route path="/labor-relations/engagement" element={
                <ProtectedRoute>
                  <EngagementRelationship />
                </ProtectedRoute>
              } />
              <Route path="/labor-relations/sports" element={
                <ProtectedRoute>
                  <SportsSocialEvents />
                </ProtectedRoute>
              } />
              <Route path="/labor-relations/union" element={
                <ProtectedRoute>
                  <UnionGrievances />
                </ProtectedRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<PlaceholderPage title="Module Loading" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VisibilityProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
