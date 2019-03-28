#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;
#[macro_use] extern crate serde_derive;

use rocket_contrib::json::{Json};

#[derive(Serialize, Deserialize)]
struct ContractResponse {
    success: bool,
    response: String
}

#[derive(Serialize, Deserialize)]
struct ContractPayload {
    number1: i32,
    number2: i32
}

#[post("/add", format = "application/json", data = "<contract_payload>")]
fn execute_contract(contract_payload: Json<ContractPayload>) -> Json<ContractResponse> {
    Json(ContractResponse {
        success: true,
        response: "Cake".to_string()
    })
}

fn main() {
    rocket::ignite().mount("/", routes![execute_contract]).launch();
}