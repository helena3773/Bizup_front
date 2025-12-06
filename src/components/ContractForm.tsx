import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { contractApi, employeeApi } from '../lib/api';

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: number;
  employeeName?: string;
  onSuccess?: () => void;
}

interface ContractData {
  // 사업주 정보
  employerName: string;
  workingConditions?: string;
  wage?: string;
  contractDate: Date;
  
  // 근로자 정보
  employeeName: string;
  employeeAddress: string;
  employeePhone: string;
  employeeSignature: string; // base64 이미지
}

export function ContractForm({ open, onOpenChange, employeeId, employeeName, onSuccess }: ContractFormProps) {
  const [step, setStep] = useState(1);
  const initialDate = new Date();
  const [contractData, setContractData] = useState<ContractData>({
    employerName: '',
    workingConditions: '',
    wage: '',
    contractDate: initialDate,
    employeeName: employeeName || '',
    employeeAddress: '',
    employeePhone: '',
    employeeSignature: '',
  });
  const [existingContractId, setExistingContractId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // 캔버스 크기 조정 - 다이얼로그가 열릴 때만 실행
  useEffect(() => {
    if (!open) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
    const timer = setTimeout(() => {
      try {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // 아직 렌더링되지 않았으면 기본값 사용
          canvas.width = 800;
          canvas.height = 200;
          if (process.env.NODE_ENV === 'development') {
            console.log('캔버스 크기 기본값 사용:', canvas.width, canvas.height);
          }
          return;
        }
        
        // 실제 화면 크기에 맞춰 캔버스 크기 설정 (스케일 없이)
        const displayWidth = Math.floor(rect.width);
        const displayHeight = Math.floor(rect.height);
        
        // 캔버스 크기를 CSS 크기와 정확히 일치시킴 (스케일링 없이)
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          // 캔버스 초기화 (흰색 배경)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, displayWidth, displayHeight);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('캔버스 크기 설정 완료:', {
              displayWidth,
              displayHeight,
              canvasWidth: canvas.width,
              canvasHeight: canvas.height
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('캔버스 크기 설정 오류:', error);
        }
        // 오류 발생 시 기본값 사용
        canvas.width = 800;
        canvas.height = 200;
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [open]);

  // 저장된 서명 이미지를 캔버스에 로드 - 다이얼로그가 열리고 서명 데이터가 있을 때
  useEffect(() => {
    if (!open) return;
    
    // 기존 계약서가 있고 서명 데이터가 있을 때만 로드
    if (!existingContractId || !contractData.employeeSignature) {
      // 새 계약서이거나 서명이 없으면 캔버스 초기화만
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }
    
    // 캔버스 크기 설정이 완료된 후 이미지 로드
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('캔버스가 없습니다 - 이미지 로드 스킵');
        }
        return;
      }

      // 캔버스 크기가 설정되지 않았으면 설정
      if (canvas.width === 0 || canvas.height === 0) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);
        } else {
          // 기본값 사용
          canvas.width = 800;
          canvas.height = 200;
        }
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('캔버스 컨텍스트를 가져올 수 없습니다');
        }
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // 캔버스 초기화
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // 흰색 배경
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // 이미지를 캔버스 크기에 맞춰 그리기
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('서명 이미지 재로드 완료:', {
              canvasWidth: canvas.width,
              canvasHeight: canvas.height,
              imageWidth: img.width,
              imageHeight: img.height,
              existingContractId
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('서명 이미지 그리기 오류:', error);
          }
        }
      };
      img.onerror = (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('서명 이미지 로드 오류:', error);
        }
      };
      img.src = contractData.employeeSignature;
    }, 800); // 캔버스 크기 설정 후 충분한 지연
    
    return () => clearTimeout(timer);
  }, [open, existingContractId, contractData.employeeSignature]); // contractData.employeeSignature 추가하여 서명 데이터 변경 시 재로드
  
  // 날짜 선택을 위한 상태 - 현재 날짜를 기준으로 초기화
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  
  // 기존 계약서 불러오기
  const loadExistingContract = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      const contracts = await contractApi.getByEmployee(employeeId);
      
      if (contracts && contracts.length > 0) {
        // 가장 최근 계약서 사용
        const latestContract = contracts[0];
        setExistingContractId(latestContract.id);
        
        // 계약서 데이터로 폼 채우기
        const contractDate = new Date(latestContract.contract_date);
        setSelectedYear(contractDate.getFullYear());
        setSelectedMonth(contractDate.getMonth() + 1);
        setSelectedDay(contractDate.getDate());
        
        setContractData({
          employerName: latestContract.employer_name || '',
          workingConditions: latestContract.working_conditions || '',
          wage: latestContract.wage || '',
          contractDate: contractDate,
          employeeName: latestContract.employee_name || employeeName || '',
          employeeAddress: latestContract.employee_address || '',
          employeePhone: latestContract.employee_phone || '',
          employeeSignature: latestContract.employee_signature || '',
        });
        
        // 서명 이미지는 useEffect에서 로드하므로 여기서는 데이터만 설정
        // 이미지 로드는 별도의 useEffect에서 처리
      } else {
        // 기존 계약서가 없으면 현재 날짜로 초기화
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedDay(currentDay);
        
        setContractData({
          employerName: '',
          workingConditions: '',
          wage: '',
          contractDate: currentDate,
          employeeName: employeeName || '',
          employeeAddress: '',
          employeePhone: '',
          employeeSignature: '',
        });
        setExistingContractId(null);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      if (process.env.NODE_ENV === 'development') {
        console.error('계약서 불러오기 오류:', errorMessage);
      }
      // 에러가 발생해도 새로 작성할 수 있도록 계속 진행
      const currentDate = new Date();
      setContractData({
        employerName: '',
        workingConditions: '',
        wage: '',
        contractDate: currentDate,
        employeeName: employeeName || '',
        employeeAddress: '',
        employeePhone: '',
        employeeSignature: '',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 다이얼로그가 열릴 때 기존 계약서 불러오기 또는 초기화
  useEffect(() => {
    if (open && employeeId) {
      loadExistingContract();
    } else if (open) {
      // 직원 ID가 없으면 초기화
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      setSelectedDay(currentDay);
      
      setContractData({
        employerName: '',
        workingConditions: '',
        wage: '',
        contractDate: currentDate,
        employeeName: employeeName || '',
        employeeAddress: '',
        employeePhone: '',
        employeeSignature: '',
      });
      setExistingContractId(null);
    }
  }, [open, employeeId, employeeName]);

  useEffect(() => {
    if (open && employeeName) {
      setContractData(prev => ({ ...prev, employeeName }));
    }
  }, [open, employeeName]);

  // 날짜 변경 시 contractDate 업데이트
  useEffect(() => {
    // 다이얼로그가 열릴 때 초기화하는 동안은 업데이트하지 않음
    if (!open) return;
    
    // 유효한 값인지 확인
    if (!selectedYear || !selectedMonth || !selectedDay) return;
    if (selectedYear < 1900 || selectedYear > 2100) return;
    if (selectedMonth < 1 || selectedMonth > 12) return;
    
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const validDay = Math.min(Math.max(1, selectedDay), daysInMonth);
    
    const newDate = new Date(selectedYear, selectedMonth - 1, validDay);
    setContractData(prev => {
      // 날짜가 실제로 변경되었을 때만 업데이트
      const prevDate = prev.contractDate;
      if (prevDate.getFullYear() === newDate.getFullYear() &&
          prevDate.getMonth() === newDate.getMonth() &&
          prevDate.getDate() === newDate.getDate()) {
        return prev;
      }
      return { ...prev, contractDate: newDate };
    });
    
    // validDay가 다르면 업데이트 (무한 루프 방지를 위해 조건 확인)
    if (validDay !== selectedDay && validDay >= 1 && validDay <= daysInMonth) {
      setSelectedDay(validDay);
    }
  }, [selectedYear, selectedMonth, selectedDay, open]);

  const resetForm = () => {
    setStep(1);
    setContractData({
      employerName: '',
      workingConditions: '',
      wage: '',
      contractDate: new Date(),
      employeeName: employeeName || '',
      employeeAddress: '',
      employeePhone: '',
      employeeSignature: '',
    });
    clearSignature();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!contractData.employerName.trim()) {
        toast.error('사업체명을 입력해 주세요.');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // CSS 크기와 캔버스 내부 크기의 비율 계산
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('좌표 계산:', { 
        clientX, 
        clientY, 
        rectLeft: rect.left, 
        rectTop: rect.top,
        x, 
        y, 
        canvasWidth: canvas.width, 
        canvasHeight: canvas.height, 
        rectWidth: rect.width, 
        rectHeight: rect.height,
        scaleX,
        scaleY
      });
    }
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    // 좌표가 캔버스 범위 내에 있는지 확인
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('좌표가 캔버스 범위를 벗어남:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
      }
      return;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // 서명 저장 (약간의 지연을 두어 확실히 저장)
    setTimeout(() => {
      saveSignature();
    }, 50);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setContractData(prev => ({ ...prev, employeeSignature: '' }));
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('캔버스가 없습니다');
      }
      return;
    }

    try {
      // 캔버스 크기가 유효한지 확인
      if (canvas.width === 0 || canvas.height === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('캔버스 크기가 0입니다:', canvas.width, canvas.height);
        }
        return;
      }

      // 캔버스를 이미지로 변환 (PNG 형식)
      const dataURL = canvas.toDataURL('image/png');
      
      // base64 데이터가 유효한지 확인 (최소 길이만 확인)
      if (dataURL && dataURL !== 'data:,' && dataURL.length > 50) {
        setContractData(prev => {
          const newData = { ...prev, employeeSignature: dataURL };
          if (process.env.NODE_ENV === 'development') {
            console.log('서명 이미지 저장됨, 길이:', dataURL.length);
            console.log('서명 이미지 데이터 시작:', dataURL.substring(0, 50));
          }
          return newData;
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('서명 이미지 데이터가 유효하지 않습니다:', dataURL?.substring(0, 50));
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('서명 저장 오류:', error);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setContractData(prev => ({ ...prev, employeePhone: numbersOnly }));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!contractData.employerName.trim()) {
      toast.error('사업체명을 입력해 주세요.');
      return;
    }
    if (!contractData.employeeName.trim()) {
      toast.error('근로자명을 입력해 주세요.');
      return;
    }
    if (!contractData.employeeAddress.trim()) {
      toast.error('근로자 주소를 입력해 주세요.');
      return;
    }
    if (!contractData.employeePhone.trim()) {
      toast.error('근로자 연락처를 입력해 주세요.');
      return;
    }

    try {
      let finalEmployeeId = employeeId;
      
      // 직원 ID가 없으면 먼저 직원을 생성
      if (!finalEmployeeId) {
        try {
          const newEmployee = await employeeApi.create({
            name: contractData.employeeName,
            role: '직원', // 기본값
            phone: contractData.employeePhone,
            join_date: contractData.contractDate.toISOString().split('T')[0],
          });
          finalEmployeeId = newEmployee.id;
          toast.success('직원 정보가 추가되었습니다.');
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          if (process.env.NODE_ENV === 'development') {
            console.error('직원 생성 오류:', errorMessage);
          }
          toast.error(`직원 정보 추가에 실패했습니다: ${errorMessage}`);
          return;
        }
      }

      // 기존 계약서가 있으면 수정 불가
      if (existingContractId) {
        toast.error('이미 작성된 근로계약서는 수정할 수 없습니다.');
        return;
      }

      // 서명 최종 확인 및 저장 - 캔버스에서 직접 가져오기
      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error('서명 캔버스를 찾을 수 없습니다.');
        return;
      }
      
      // 먼저 서명을 저장
      saveSignature();
      
      // 약간의 지연 후 캔버스에서 직접 서명 데이터 가져오기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let finalSignature = '';
      try {
        // 캔버스에서 직접 서명 데이터 가져오기
        const dataURL = canvas.toDataURL('image/png');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('캔버스 서명 데이터 길이:', dataURL.length);
          console.log('캔버스 서명 데이터 시작:', dataURL.substring(0, 50));
        }
        
        // 빈 캔버스인지 확인 (data:, 또는 매우 짧은 데이터는 빈 캔버스)
        if (dataURL && dataURL !== 'data:,' && dataURL.length > 100) {
          finalSignature = dataURL;
        } else {
          // contractData에 저장된 서명이 있으면 사용
          if (contractData.employeeSignature && contractData.employeeSignature.length > 100) {
            finalSignature = contractData.employeeSignature;
            if (process.env.NODE_ENV === 'development') {
              console.log('contractData에서 서명 사용, 길이:', finalSignature.length);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('서명 데이터 가져오기 오류:', error);
        }
        // contractData에 저장된 서명이 있으면 사용
        if (contractData.employeeSignature && contractData.employeeSignature.length > 100) {
          finalSignature = contractData.employeeSignature;
        }
      }
      
      // 이미지 데이터가 있으면 저장 (최소 길이만 확인)
      if (!finalSignature || finalSignature.length < 50) {
        toast.error('근로자 서명을 입력해 주세요.');
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('최종 서명 이미지 데이터 길이:', finalSignature.length);
        console.log('최종 서명 이미지 데이터 시작:', finalSignature.substring(0, 50));
        console.log('최종 서명 이미지 데이터 끝:', finalSignature.substring(finalSignature.length - 50));
      }

      // 새 계약서 생성
      const contractDataToSend = {
        employee_id: finalEmployeeId,
        employer_name: contractData.employerName.trim(),
        working_conditions: contractData.workingConditions?.trim() || undefined,
        wage: contractData.wage?.trim() || undefined,
        contract_date: contractData.contractDate.toISOString().split('T')[0],
        employee_name: contractData.employeeName.trim(),
        employee_address: contractData.employeeAddress.trim(),
        employee_phone: contractData.employeePhone.trim(),
        employee_signature: finalSignature,
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('전송할 계약서 데이터:', {
          ...contractDataToSend,
          employee_signature: `[길이: ${contractDataToSend.employee_signature.length}] ${contractDataToSend.employee_signature.substring(0, 50)}...`
        });
      }
      
      const createdContract = await contractApi.create(contractDataToSend);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('계약서 저장 성공:', createdContract);
      }
      
      toast.success('근로계약서가 작성되었습니다.');
      
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      if (process.env.NODE_ENV === 'development') {
        console.error('근로계약서 작성 오류:', error);
      }
      toast.error(`근로계약서 작성에 실패했습니다: ${errorMessage}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <style>{`
        #employerName::placeholder,
        #workingConditions::placeholder,
        #wage::placeholder,
        #employeeName::placeholder,
        #employeeAddress::placeholder,
        #employeePhone::placeholder {
          font-size: calc(0.875rem - 1px);
        }
        #employerName,
        #workingConditions,
        #wage,
        #employeeName,
        #employeeAddress,
        #employeePhone {
          font-size: calc(0.875rem - 1px) !important;
        }
        [data-date-picker] [class*="head_row"],
        [data-date-picker] [class*="row"] {
          display: flex !important;
          width: 100% !important;
          gap: 0 !important;
        }
        [data-date-picker] [class*="head_cell"],
        [data-date-picker] [class*="cell"] {
          flex: 1 1 0% !important;
          min-width: 0 !important;
          width: calc(100% / 7) !important;
          max-width: calc(100% / 7) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        [data-date-picker] [class*="day"] {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
      <DialogContent className="bg-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-lg font-semibold">
              표준 근로계약서 작성
            </DialogTitle>
            <span className="text-sm text-gray-500 ml-auto">{step}/2</span>
          </div>
          <DialogDescription className="sr-only">
            근로계약서 작성 양식
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4" style={{ fontSize: 'calc(1rem + 2px)' }}>사업주 정보</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="employerName" className="text-sm">
                      (사업주) 사업체명 <span className="text-blue-600">*</span>
                    </Label>
                    <span className="text-xs text-gray-400">
                      {contractData.employerName.length}/25
                    </span>
                  </div>
                  <Input
                    id="employerName"
                    value={contractData.employerName}
                    onChange={(e) => {
                      if (existingContractId) return;
                      const value = e.target.value;
                      if (value.length <= 25) {
                        setContractData(prev => ({ ...prev, employerName: value }));
                      }
                    }}
                    placeholder="(사업주)사업체명을 입력해 주세요."
                    className="h-10 text-gray-300"
                    maxLength={25}
                    readOnly={!!existingContractId}
                    disabled={!!existingContractId}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="workingConditions" className="text-sm">
                    근무조건 (선택)
                  </Label>
                  <Textarea
                    id="workingConditions"
                    value={contractData.workingConditions}
                    onChange={(e) => {
                      if (existingContractId) return;
                      setContractData(prev => ({ ...prev, workingConditions: e.target.value }));
                    }}
                    placeholder="근무조건을 선택하세요"
                    className="min-h-24 text-gray-300 resize-y"
                    rows={4}
                    readOnly={!!existingContractId}
                    disabled={!!existingContractId}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="wage" className="text-sm">
                    임금 (선택)
                  </Label>
                  <Input
                    id="wage"
                    value={contractData.wage}
                    onChange={(e) => {
                      if (existingContractId) return;
                      setContractData(prev => ({ ...prev, wage: e.target.value }));
                    }}
                    placeholder="임금을 선택하세요"
                    className="h-10 text-gray-300"
                    readOnly={!!existingContractId}
                    disabled={!!existingContractId}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contractDate" className="text-sm">
                    작성일
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="contractYear"
                      type="number"
                      value={selectedYear ?? ''}
                      onChange={(e) => {
                        if (existingContractId) return;
                        const value = e.target.value;
                        if (value === '') {
                          setSelectedYear(0);
                          return;
                        }
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue) && numValue >= 1900 && numValue <= 2100) {
                          setSelectedYear(numValue);
                        }
                      }}
                      placeholder="년도"
                      className="h-10 text-gray-300"
                      min={1900}
                      max={2100}
                      readOnly={!!existingContractId}
                      disabled={!!existingContractId}
                    />
                    <Input
                      id="contractMonth"
                      type="number"
                      value={selectedMonth ?? ''}
                      onChange={(e) => {
                        if (existingContractId) return;
                        const value = e.target.value;
                        if (value === '') {
                          setSelectedMonth(0);
                          return;
                        }
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                          setSelectedMonth(numValue);
                        }
                      }}
                      placeholder="월"
                      className="h-10 text-gray-300"
                      min={1}
                      max={12}
                      readOnly={!!existingContractId}
                      disabled={!!existingContractId}
                    />
                    <Input
                      id="contractDay"
                      type="number"
                      value={selectedDay ?? ''}
                      onChange={(e) => {
                        if (existingContractId) return;
                        const value = e.target.value;
                        if (value === '') {
                          setSelectedDay(0);
                          return;
                        }
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          const maxDay = new Date(selectedYear || new Date().getFullYear(), selectedMonth || new Date().getMonth() + 1, 0).getDate();
                          if (numValue >= 1 && numValue <= maxDay) {
                            setSelectedDay(numValue);
                          }
                        }
                      }}
                      placeholder="일"
                      className="h-10 text-gray-300"
                      min={1}
                      max={31}
                      readOnly={!!existingContractId}
                      disabled={!!existingContractId}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                다음
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4" style={{ fontSize: 'calc(1rem + 2px)' }}>근로자 정보</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="employeeName" className="text-sm">
                    근로자명 <span className="text-blue-600">*</span>
                  </Label>
                  <Input
                    id="employeeName"
                    value={contractData.employeeName}
                    onChange={(e) => {
                      if (existingContractId) return;
                      setContractData(prev => ({ ...prev, employeeName: e.target.value }));
                    }}
                    placeholder="근로자명을 입력해 주세요."
                    className="h-10 text-gray-300"
                    readOnly={!!existingContractId}
                    disabled={!!existingContractId}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="employeeAddress" className="text-sm">
                      근로자 주소 <span className="text-blue-600">*</span>
                    </Label>
                    <span className="text-xs text-gray-400">
                      {contractData.employeeAddress.length}/50
                    </span>
                  </div>
                  <Input
                    id="employeeAddress"
                    value={contractData.employeeAddress}
                    onChange={(e) => {
                      if (existingContractId) return;
                      const value = e.target.value;
                      if (value.length <= 50) {
                        setContractData(prev => ({ ...prev, employeeAddress: value }));
                      }
                    }}
                    placeholder="근로자 주소를 입력해 주세요."
                    className="h-10 text-gray-300"
                    maxLength={50}
                    readOnly={!!existingContractId}
                    disabled={!!existingContractId}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="employeePhone" className="text-sm">
                    근로자 연락처 <span className="text-blue-600">*</span>
                  </Label>
                  <Input
                    id="employeePhone"
                    value={contractData.employeePhone}
                    onChange={(e) => {
                      if (existingContractId) return;
                      handlePhoneChange(e.target.value);
                    }}
                    placeholder="숫자만 입력해 주세요."
                    className="h-10 text-gray-300"
                    type="tel"
                    readOnly={!!existingContractId}
                    disabled={!!existingContractId}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="employeeSignature" className="text-sm">
                      근로자 서명 <span className="text-blue-600">*</span>
                    </Label>
                    {!existingContractId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSignature}
                        className="h-8 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        초기화
                      </Button>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      className={`w-full h-[200px] border border-gray-200 rounded bg-white ${existingContractId ? 'cursor-default' : 'cursor-crosshair'}`}
                      onMouseDown={existingContractId ? undefined : startDrawing}
                      onMouseMove={existingContractId ? undefined : draw}
                      onMouseUp={existingContractId ? undefined : stopDrawing}
                      onMouseLeave={existingContractId ? undefined : stopDrawing}
                      onTouchStart={existingContractId ? undefined : startDrawing}
                      onTouchMove={existingContractId ? undefined : draw}
                      onTouchEnd={existingContractId ? undefined : stopDrawing}
                      style={{ pointerEvents: existingContractId ? 'none' : 'auto' }}
                    />
                    {!contractData.employeeSignature && !existingContractId && (
                      <p className="text-center text-gray-400 text-sm mt-2">
                        서명을 입력해 주세요.
                      </p>
                    )}
                    {existingContractId && contractData.employeeSignature && (
                      <p className="text-center text-green-600 text-sm mt-2">
                        서명이 저장되어 있습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                이전
              </Button>
              {existingContractId ? (
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  닫기
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  계약서 작성완료
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

