import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SolicitudAcceso {
  nombre: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { nombre, email }: SolicitudAcceso = await req.json();

    if (!nombre || !email) {
      return new Response(
        JSON.stringify({ error: "Faltan datos requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Nueva solicitud de acceso: ${nombre} (${email})`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Sistema INEXO <onboarding@resend.dev>",
            to: ["jgarcia@inexo.es"],
            subject: `Nueva solicitud de acceso - ${nombre}`,
            html: `
              <h2>Nueva Solicitud de Acceso al Sistema</h2>
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Email:</strong> ${email}</p>
              <br>
              <p>Por favor, revisa la solicitud en la tabla de usuarios y aprueba o rechaza el acceso.</p>
              <br>
              <p><a href="${supabaseUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ir al Dashboard</a></p>
            `,
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error("Error de Resend:", errorText);
          throw new Error(`Error de Resend: ${errorText}`);
        }

        const resendData = await resendResponse.json();
        console.log("Email enviado exitosamente:", resendData);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Solicitud de acceso registrada. Se ha notificado a jgarcia@inexo.es",
            nombre,
            email,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (emailError) {
        console.error("Error al enviar email con Resend:", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY no configurada, saltando envío de email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Solicitud registrada. El administrador revisará tu solicitud manualmente.",
        warning: "No se pudo enviar notificación por email (configurar RESEND_API_KEY)",
        nombre,
        email,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error procesando solicitud:", error);
    return new Response(
      JSON.stringify({ error: "Error al procesar la solicitud" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});