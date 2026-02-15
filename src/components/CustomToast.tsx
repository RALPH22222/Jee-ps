import { type Toast } from 'react-hot-toast';

interface CustomToastProps {
    t: Toast;
    message: string;
    type: 'success' | 'error';
}

export const CustomToast = ({ t, message, type }: CustomToastProps) => {
    return (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative overflow-hidden`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {type === 'success' ? (
                            <svg className="h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {type === 'success' ? 'Success' : 'Error'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div
                className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-teal-500' : 'bg-red-500'} animate-progress`}
                style={{ width: '100%' }}
            />
        </div>
    );
};
