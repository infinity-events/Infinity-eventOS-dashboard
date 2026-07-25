import { useEffect, useState } from "react";
import { useFestival } from "../contexts/FestivalContext";


export default function Festivals(){


    const {
        festival,
        setFestival
    } = useFestival();



    const [editing,setEditing] = useState(false);



    const [form,setForm] = useState({

        name:"",
        location:"",
        date:""

    });



    useEffect(()=>{

        if(festival){

            setForm({

                name:festival.name || "",
                location:festival.location || "",
                date:festival.date || ""

            });

        }

    },[festival]);




    if(!festival){

        return (

            <div className="
            text-white
            text-2xl
            p-10
            ">

                Nessun festival creato

            </div>

        );

    }





    function save(){


        setFestival({

            ...festival,

            ...form

        });


        setEditing(false);


    }





    return (

        <div>


            <div className="
            flex
            justify-between
            items-center
            mb-10
            ">


                <div>


                    <h1 className="
                    text-4xl
                    font-bold
                    ">

                        {festival.name}

                    </h1>


                    <p className="
                    text-gray-400
                    mt-2
                    ">

                        Gestione evento

                    </p>


                </div>



                <button

                onClick={()=>setEditing(true)}

                className="
                bg-purple-600
                hover:bg-purple-500
                px-6
                py-3
                rounded-xl
                font-bold
                transition
                "

                >

                    Modifica festival

                </button>



            </div>





            <div className="
            h-60
            rounded-3xl
            bg-gradient-to-r
            from-purple-700
            to-blue-600
            flex
            items-center
            p-10
            mb-8
            ">


                <h2 className="
                text-5xl
                font-bold
                ">

                    {festival.name}

                </h2>


            </div>







            <div className="
            grid
            grid-cols-4
            gap-6
            ">



                <InfoCard

                title="Stato"

                value={festival.status || "Bozza"}

                />



                <InfoCard

                title="Biglietti"

                value={festival.tickets?.length || 0}

                />



                <InfoCard

                title="Partecipanti"

                value="0"

                />



                <InfoCard

                title="Bracciali"

                value="0"

                />



            </div>







            <div className="
            mt-8
            bg-[#17181D]
            rounded-2xl
            p-8
            border
            border-white/5
            ">



                <h2 className="
                text-2xl
                font-bold
                mb-6
                ">

                    Informazioni evento

                </h2>




                <div className="
                space-y-3
                text-gray-300
                ">


                    <p>

                        📍 {festival.location}

                    </p>



                    <p>

                        📅 {festival.date}

                    </p>



                </div>



            </div>







            {

            editing && (


                <div className="
                fixed
                inset-0
                bg-black/70
                flex
                items-center
                justify-center
                ">


                    <div className="
                    bg-[#17181D]
                    rounded-3xl
                    p-8
                    w-[450px]
                    ">


                        <h2 className="
                        text-2xl
                        font-bold
                        mb-5
                        ">

                            Modifica festival

                        </h2>




                        <input

                        className="input"

                        placeholder="Nome festival"

                        value={form.name}

                        onChange={e=>

                            setForm({

                                ...form,

                                name:e.target.value

                            })

                        }

                        />





                        <input

                        className="input"

                        placeholder="Luogo"

                        value={form.location}

                        onChange={e=>

                            setForm({

                                ...form,

                                location:e.target.value

                            })

                        }

                        />





                        <input

                        className="input"

                        type="date"

                        value={form.date}

                        onChange={e=>

                            setForm({

                                ...form,

                                date:e.target.value

                            })

                        }

                        />






                        <button

                        onClick={save}

                        className="
                        mt-6
                        w-full
                        bg-purple-600
                        hover:bg-purple-500
                        p-4
                        rounded-xl
                        font-bold
                        "

                        >

                            Salva modifiche

                        </button>




                    </div>


                </div>


            )

            }





        </div>

    )

}






function InfoCard({title,value}){


return (

<div className="
bg-[#17181D]
rounded-2xl
p-6
border
border-white/5
">


<p className="
text-gray-400
">

{title}

</p>


<h3 className="
text-3xl
font-bold
mt-3
">

{value}

</h3>


</div>

)

}