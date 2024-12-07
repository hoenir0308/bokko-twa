import { ApiService } from '@/lib/services/api_service';
import { User } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const RegisterForm: React.FC = () => {
    const initData = useInitData(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [post, setPost] = useState('');
    const [age, setAge] = useState(0);
    const [gender, setGender] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!initData) return;
        setFirstName(initData.user?.firstName || '');
        setLastName(initData.user?.lastName || '');
    }, [initData]);

    const handleRegister = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!initData) return;

            const errors: Record<string, string> = {};

            if (!firstName) {
                errors.firstName = 'Поле имени обязательно';
            }
            if (!lastName) {
                errors.lastName = 'Поле фамилии обязательно';
            }
            if (!post) {
                errors.post = 'Поле должности обязательно';
            }
            if (!age || age < 1) {
                errors.age = 'Поле возраста обязательно';
            }
            if (!gender) {
                errors.gender = 'Поле пола обязательно';
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }

            const user: User = {
                first_name: firstName,
                last_name: lastName,
                post,
                age,
                gender,
                tg_id: initData.user?.id,
            };
            const initDataStr = new URLSearchParams({
                query_id: initData.queryId as string,
                auth_date: (initData.authDate.getTime() / 1000).toString(),
                hash: initData.hash,
                user: JSON.stringify({
                    id: initData.user?.id,
                    first_name: initData.user?.firstName,
                    last_name: initData.user?.lastName,
                    username: initData.user?.username,
                    language_code: initData.user?.languageCode,
                    is_premium: initData.user?.isPremium,
                    allows_write_to_pm: initData.user?.allowsWriteToPm,
                }),
            }).toString();
            await ApiService.reg(user, initDataStr);
            window.location.reload();
        },
        [firstName, lastName, post, age, gender, initData]
    );

    return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Добро пожаловать в bokko bot</h1>
            <form onSubmit={handleRegister} className="bg-white shadow-md rounded-lg p-6 space-y-4 w-full max-w-md">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            Имя
                        </Label>
                        <Input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    {formErrors.firstName && (
                        <Alert variant="destructive">
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>{formErrors.firstName}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Фамилия
                        </Label>
                        <Input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    {formErrors.lastName && (
                        <Alert variant="destructive">
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>{formErrors.lastName}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="post" className="block text-sm font-medium text-gray-700">
                            Должность
                        </Label>
                        <Input type="text" id="post" value={post} onChange={(e) => setPost(e.target.value)} />
                    </div>
                    {formErrors.post && (
                        <Alert variant="destructive">
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>{formErrors.post}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="age" className="block text-sm font-medium text-gray-700">
                            Возраст
                        </Label>
                        <Input type="number" id="age" value={age} onChange={(e) => setAge(Number(e.target.value))} />
                    </div>
                    {formErrors.age && (
                        <Alert variant="destructive">
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>{formErrors.age}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                            Пол
                        </Label>
                        <Input type="text" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
                    </div>
                    {formErrors.gender && (
                        <Alert variant="destructive">
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>{formErrors.gender}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <Button type="submit" className="w-full">
                    Ввести
                </Button>
            </form>
        </div>
    );
};

export default RegisterForm;
