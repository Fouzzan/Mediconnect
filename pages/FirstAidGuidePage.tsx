import React, { useState } from 'react';
import { HeartPulseIcon, BriefcaseIcon, TreePineIcon, AlertTriangleIcon, ZapIcon, XIcon } from '../components/Icons';

// Types
interface InstructionStep {
    title: string;
    description: string;
}

interface Emergency {
  name: string;
  instructions: InstructionStep[];
}

interface EmergencyCategory {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: Emergency[];
}

// Data
const firstAidData: EmergencyCategory[] = [
    {
        category: 'Medical Emergencies',
        icon: HeartPulseIcon,
        iconColor: 'text-red-500',
        items: [
            {
                name: 'Heart Attack',
                instructions: [ { title: 'Call Emergency Services Immediately', description: 'Dial your local emergency number without delay. Time is critical.' }, { title: 'Sit and Rest', description: 'Have the person sit down, rest, and try to keep calm. Loosen any tight clothing.' }, { title: 'Aspirin', description: 'If the person is conscious and not allergic, have them chew and swallow one regular-strength aspirin.' }, { title: 'Begin CPR if Unconscious', description: 'If the person becomes unconscious and is not breathing normally, begin CPR.' }, ]
            },
            {
                name: 'Stroke (F.A.S.T.)',
                instructions: [ { title: 'F - Face Drooping', description: 'Does one side of the face droop? Ask the person to smile.' }, { title: 'A - Arm Weakness', description: 'Is one arm weak or numb? Ask the person to raise both arms.' }, { title: 'S - Speech Difficulty', description: 'Is speech slurred? Ask them to repeat a simple sentence.' }, { title: 'T - Time to Call for Help', description: 'If you see any of these signs, call emergency services immediately.' }, ]
            },
            { name: 'CPR (Cardiopulmonary Resuscitation)', instructions: [ { title: 'Check Scene and Response', description: 'Ensure the scene is safe. Tap and shout, "Are you OK?" Check for breathing.' }, { title: 'Call for Help', description: 'Tell someone to call 911 and get an AED.' }, { title: 'Start Chest Compressions', description: 'Push hard and fast in the center of the chest (100-120 compressions per minute).' } ] },
            { name: 'Seizures / Epilepsy', instructions: [ { title: 'Keep the Person Safe', description: 'Move them away from hazards. Place something soft under their head.' }, { title: 'Do Not Restrain', description: 'Do not hold the person down or put anything in their mouth.' }, { title: 'Time the Seizure', description: 'If it lasts more than 5 minutes, call for help.' }, { title: 'Recovery Position', description: 'Once the seizure stops, gently roll them onto their side.' } ] },
            { name: 'Diabetic Emergencies', instructions: [ { title: 'Give Sugar', description: 'If the person is conscious and can swallow, give them a sugary drink, candy, or glucose tablet for low blood sugar.' }, { title: 'Call for Help', description: 'If they are unconscious or do not improve quickly, call emergency services.' } ] },
            { name: 'Severe Allergic Reaction (Anaphylaxis)', instructions: [ { title: 'Call Emergency Services', description: 'This is a life-threatening emergency.' }, { title: 'Use an Epinephrine Auto-Injector', description: 'If the person has one (like an EpiPen), help them use it.' }, { title: 'Lay Person Down', description: 'Have them lie flat and elevate their legs.' } ] },
            { name: 'Asthma Attack', instructions: [ { title: 'Help Use Inhaler', description: 'Assist the person in using their prescribed quick-relief inhaler.' }, { title: 'Sit Upright', description: 'Help them sit in a comfortable upright position to ease breathing.' }, { title: 'Call for Help', description: 'If breathing does not improve after a few minutes, call emergency services.' } ] },
            { name: 'Shock', instructions: [ { title: 'Call for Help Immediately', description: 'Shock can be life-threatening.' }, { title: 'Lay the Person Down', description: 'Have them lie on their back and elevate their legs about 12 inches, unless you suspect a head, neck, or back injury.' }, { title: 'Keep Them Warm', description: 'Cover them with a blanket or coat.' }, { title: 'Do Not Give Food or Drink', description: 'The person should not eat or drink anything.' } ] }
        ],
    },
    {
        category: 'Injuries & Trauma',
        icon: BriefcaseIcon,
        iconColor: 'text-cyan-600',
        items: [
             {
                name: 'Bleeding',
                instructions: [
                    { title: 'Call for Help for Severe Bleeding', description: 'Call emergency services for any major, uncontrolled bleeding or suspected internal bleeding.' },
                    { title: 'Apply Direct, Firm Pressure', description: 'For external bleeding, use a clean cloth, bandage, or gauze and press firmly on the wound. Use your palms to apply steady pressure.' },
                    { title: 'Elevate the Limb', description: "If the wound is on an arm or leg, and it doesn't cause more pain, raise it above the level of the heart to help reduce blood flow." },
                    { title: 'Clean Minor Cuts', description: 'For minor cuts and abrasions, wash the area with soap and water, apply an antiseptic, and cover with a sterile bandage.' },
                    { title: 'Internal Bleeding Signs', description: 'Watch for signs like pain, swelling, pale or clammy skin, rapid pulse, or lightheadedness. Seek immediate medical help if suspected.' },
                ],
            },
            { name: 'Burns', instructions: [ { title: 'Cool the Burn', description: 'Run cool (not cold) water over the burn for 10-20 minutes. Do not use ice.' }, { title: 'Remove Jewelry/Clothing', description: 'Gently remove anything near the burn unless it is stuck.' }, { title: 'Cover the Burn', description: 'Use a sterile, non-stick dressing. Do not apply ointments.' } ] },
            { name: 'Broken Bones / Fractures', instructions: [ { title: 'Immobilize the Area', description: 'Keep the injured limb from moving. Do not try to realign the bone.' }, { title: 'Apply a Cold Pack', description: 'Wrap a cold pack or bag of ice in a cloth and apply to the area to reduce swelling.' }, { title: 'Seek Medical Help', description: 'Call for help, especially for major fractures.' } ] },
            { name: 'Sprains and Strains (R.I.C.E.)', instructions: [ { title: 'Rest', description: 'Stop the activity and rest the injured area.' }, { title: 'Ice', description: 'Apply an ice pack for 20 minutes every 2-3 hours.' }, { title: 'Compression', description: 'Wrap the area with an elastic bandage to reduce swelling.' }, { title: 'Elevation', description: 'Keep the injured part elevated above the level of the heart.' } ] },
            { name: 'Head Injury / Concussion', instructions: [ { title: 'Look for Danger Signs', description: 'Watch for changes in consciousness, severe headache, vomiting, or confusion.' }, { title: 'Keep the Person Still', description: 'Have them rest in a quiet place. Avoid moving their head and neck.' }, { title: 'Seek Medical Attention', description: 'For any suspected concussion or serious head injury, see a doctor.' } ] },
            { name: 'Spinal Injury', instructions: [ { title: 'Do Not Move the Person', description: 'Moving someone with a spinal injury can cause permanent paralysis. Wait for medical professionals.' }, { title: 'Hold Head and Neck Still', description: 'If you must move them, keep their head, neck, and back aligned.' }, { title: 'Call for Help Immediately', description: 'This is a critical emergency.' } ] }
        ]
    },
    {
        category: 'Environmental Emergencies',
        icon: TreePineIcon,
        iconColor: 'text-green-600',
        items: [
            { name: 'Heatstroke / Heat Exhaustion', instructions: [ { title: 'Move to a Cool Place', description: 'Get the person out of the sun and into a cool, air-conditioned space.' }, { title: 'Cool the Skin', description: 'Use cool cloths, a cool bath, or a fan to cool their skin.' }, { title: 'Hydrate (if conscious)', description: 'Give small sips of cool water.' }, { title: 'Call for Help for Heatstroke', description: 'Heatstroke (high body temp, confusion, no sweating) is a medical emergency.' } ] },
            { name: 'Hypothermia / Frostbite', instructions: [ { title: 'Move to a Warm Place', description: 'Get the person out of the cold.' }, { title: 'Remove Wet Clothing', description: 'Replace with warm, dry clothes and blankets.' }, { title: 'Warm the Center of the Body', description: 'Focus on the chest, neck, head, and groin.' }, { title: 'Do Not Rub Frostbitten Areas', description: 'This can cause more damage. Use warm (not hot) water.' } ] },
            { name: 'Poisoning', instructions: [ { title: 'Call Poison Control', description: 'Immediately call your local poison control center for expert advice.' }, { title: 'Gather Information', description: 'Be ready to provide the person\'s age, weight, the substance ingested, and the amount.' }, { title: 'Do Not Induce Vomiting', description: 'Only do so if instructed by a medical professional.' } ] },
            { name: 'Animal and Insect Bites/Stings', instructions: [ { title: 'Clean the Wound', description: 'Wash the area with soap and water.' }, { title: 'Apply a Cold Pack', description: 'This can help reduce pain and swelling.' }, { title: 'Watch for Allergic Reactions', description: 'Look for swelling, hives, or difficulty breathing. Call for help if these occur.' } ] }
        ]
    },
    {
        category: 'Everyday Common Emergencies',
        icon: AlertTriangleIcon,
        iconColor: 'text-yellow-600',
        items: [
            { name: 'Choking (Adult, Child, Infant)', instructions: [ { title: 'Encourage Coughing', description: 'If the person can cough or speak, let them continue.' }, { title: 'Give Back Blows', description: 'If they cannot cough, give 5 sharp blows between the shoulder blades.' }, { title: 'Give Abdominal Thrusts', description: 'Perform 5 abdominal thrusts (Heimlich Maneuver).' }, { title: 'Call for Help', description: 'If the person becomes unconscious, call for help and start CPR.' } ] },
            { name: 'Nosebleeds', instructions: [ { title: 'Sit and Lean Forward', description: 'This prevents swallowing blood.' }, { title: 'Pinch the Nose', description: 'Pinch the soft part of the nose for 10-15 minutes.' }, { title: 'Seek Help If...', description: 'Bleeding does not stop after 20 minutes or if it was caused by an injury.' } ] },
            { name: 'Eye Injuries', instructions: [ { title: 'Do Not Rub', description: 'Rubbing can cause more damage.' }, { title: 'Rinse the Eye', description: 'For chemicals or small debris, rinse the eye with clean water for 15-20 minutes.' }, { title: 'Cover the Eye', description: 'For objects in the eye, cover it with a protective cup (like a paper cup) and seek medical help. Do not try to remove it.' } ] }
        ]
    },
    {
        category: 'Special Situations',
        icon: ZapIcon,
        iconColor: 'text-purple-600',
        items: [
            { name: 'Electric Shock', instructions: [ { title: 'Turn Off Power Source', description: 'Do not touch the person until the power is off.' }, { title: 'Check for Breathing', description: 'If the person is not breathing, begin CPR.' }, { title: 'Check for Burns', description: 'Look for both entry and exit burns.' }, { title: 'Call for Help', description: 'All electrical shocks require medical evaluation.' } ] },
            { name: 'Crush Injuries', instructions: [ { title: 'Call for Help Immediately', description: 'This is a serious emergency.' }, { title: 'Control Bleeding', description: 'Apply pressure to any external wounds.' }, { title: 'Do Not Remove Heavy Objects', description: 'Wait for emergency personnel, as removing the object can cause a sudden release of toxins.' } ] }
        ]
    }
];

// Modal Component
const EmergencyDetailModal: React.FC<{
    emergency: Emergency;
    onClose: () => void;
}> = ({ emergency, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh] transform transition-all animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <BriefcaseIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{emergency.name}</h2>
                            <p className="text-sm text-gray-500">Follow these steps carefully.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {emergency.instructions.map((step, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-cyan-500 text-white font-bold rounded-full">
                                {index + 1}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
                                <p className="mt-1 text-gray-600 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const FirstAidGuidePage: React.FC = () => {
    const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

    const handleOpenModal = (emergency: Emergency) => {
        setSelectedEmergency(emergency);
    };

    const handleCloseModal = () => {
        setSelectedEmergency(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">First-Aid Guide</h1>
            
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-md" role="alert">
                <p>In a life-threatening emergency, call your local emergency number immediately.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {firstAidData.map((category) => {
                    const Icon = category.icon;
                    return (
                        <div key={category.category} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className={`w-6 h-6 ${category.iconColor}`} />
                                <h2 className="text-xl font-bold text-gray-800">{category.category}</h2>
                            </div>
                            <div className="space-y-2">
                                {category.items.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => handleOpenModal(item)}
                                        className="w-full text-left p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedEmergency && (
                <EmergencyDetailModal
                    emergency={selectedEmergency}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default FirstAidGuidePage;
