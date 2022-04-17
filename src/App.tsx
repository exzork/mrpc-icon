import React, {useEffect} from "react";
import Swal from "sweetalert2";

interface Icon{
    id: string,
    name: string,
    type: string,
}

export default function App(props: {}){
    const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;

    const [icons, setIcons] = React.useState<Array<Icon>>([]);
    const inputFile = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputFile.current!.click();
    }

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            uploadIcon({
                image: reader.result as string,
                name: file.name.replace(/\.[^/.]+$/, "").replaceAll(".", "_"),
                type: "1",
            });
        }
    }

    React.useEffect(() => {
        getIcons().then(icons =>{
            setIcons(icons);
        });
    }, [])

    const uploadIcon = async (dataIcon:{image:string, name:string, type:string}) => {
        const response = await fetch("https://mrpc-server.exzork.me/upload", {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method: "POST",
            body: JSON.stringify(dataIcon)
        });
        if(response.status === 200){
            let json = await response.json();
            if(json["id"] !== undefined){
                setIcons([...icons, json]);
                await Swal.fire({
                    title: "Success",
                    text: "Upload success",
                    icon: "success",
                    toast: true,
                    position: "top-end",
                });
            }else{
                await Swal.fire("Error", "Something went wrong. Minimal icon size is 512x512px.", "error");
            }
        }else{
            await Swal.fire({
                title: "Error",
                text: "Error uploading icon",
                icon: "error",
                confirmButtonText: "OK"
            });
        }

    }

    const getIcons = async () => {
        const response = await fetch("https://discord.com/api/v9/oauth2/applications/"+DISCORD_CLIENT_ID+"/assets");
        return await response.json();
    }
    return (
        <>
            <div className="min-h-full">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">MRPC Icon List</h1>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                            <input type="file" id="file" ref={inputFile} onChange={handleChange} name="file" accept="image/*" className="hidden"/>
                            <div className="bg-white overflow-wrap shadow-lg rounded-lg place-items-center">
                                <button onClick={handleClick} className="w-48 h-52 bg-white text-gray-900 font-bold rounded-lg shadow-lg hover:bg-gray-100 px-6 py-3">
                                    <svg className="w-36 h-36" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" color="#525252"
                                              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </button>
                            </div>
                            {icons.map(icon => {
                                return (
                                    <div key={icon.id} className="bg-white overflow-wrap shadow-lg rounded-lg place-items-center">
                                        <div className="px-6 py-6 sm:px-6">
                                            <img className="w-full object-cover" src={`https://cdn.discordapp.com/app-assets/${DISCORD_CLIENT_ID}/${icon.id}.png`} alt={icon.name}/>
                                            <div className="text-center text-xs">{icon.name}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}